const fs = require('node:fs');
const path = require('node:path');
const { withDangerousMod } = require('@expo/config-plugins');

const SPEECH_MODULE_KT = `package expo.modules.speech

import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.speech.tts.Voice
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.ArrayDeque
import java.util.Locale
import java.util.Queue

const val speakingStartedEvent = "Exponent.speakingStarted"
const val speakingWillSayNextStringEvent = "Exponent.speakingWillSayNextString"
const val speakingDoneEvent = "Exponent.speakingDone"
const val speakingStoppedEvent = "Exponent.speakingStopped"
const val speakingErrorEvent = "Exponent.speakingError"

class SpeechModule : Module() {
  private val delayedUtterances: Queue<Utterance> = ArrayDeque()
  private val delayedGetVoices: Queue<Promise> = ArrayDeque()

  override fun definition() = ModuleDefinition {
    Name("ExpoSpeech")

    Events(
      speakingStartedEvent,
      speakingWillSayNextStringEvent,
      speakingDoneEvent,
      speakingStoppedEvent,
      speakingErrorEvent
    )

    Constant("maxSpeechInputLength") {
      TextToSpeech.getMaxSpeechInputLength()
    }

    OnActivityDestroys {
      synchronized(this@SpeechModule) {
        _ttsReady = false
        _textToSpeech?.shutdown()
        _textToSpeech = null
        delayedUtterances.clear()
        delayedGetVoices.clear()
      }
    }

    AsyncFunction<Boolean>("isSpeaking") {
      _textToSpeech?.isSpeaking == true
    }

    AsyncFunction("getVoices") { promise: Promise ->
      synchronized(this@SpeechModule) {
        if (isTextToSpeechReady) {
          promise.resolve(getVoices())
          return@AsyncFunction
        }
        delayedGetVoices.add(promise)
      }
      textToSpeech
    }

    AsyncFunction<Unit>("stop") {
      synchronized(this@SpeechModule) {
        delayedUtterances.clear()
        _textToSpeech?.stop()
      }
    }

    AsyncFunction("speak") { id: String, text: String, options: SpeechOptions ->
      if (text.length > TextToSpeech.getMaxSpeechInputLength()) {
        throw SpeechInputIsToLongException()
      }

      val ready = synchronized(this@SpeechModule) {
        if (isTextToSpeechReady) {
          true
        } else {
          delayedUtterances.add(Utterance(id, text, options))
          false
        }
      }
      if (ready) {
        speakOut(id, text, options)
      } else {
        textToSpeech
      }
      Unit
    }
  }

  private fun getVoices(): List<VoiceRecord> {
    val nativeVoices = try {
      textToSpeech.voices?.toList() ?: emptyList()
    } catch (err: Exception) {
      throw SpeechUnableToGetVoicesException(err)
    }

    return nativeVoices.map {
      val quality = if (it.quality > Voice.QUALITY_NORMAL) {
        VoiceQuality.ENHANCED
      } else {
        VoiceQuality.DEFAULT
      }

      VoiceRecord(
        identifier = it.name,
        name = it.name,
        quality = quality,
        language = LanguageUtils.getISOCode(it.locale)
      )
    }
  }

  private fun speakOut(id: String, text: String, options: SpeechOptions) {
    options.pitch?.let(textToSpeech::setPitch)
    options.rate?.let(textToSpeech::setSpeechRate)

    val requestedTag = options.language?.trim()?.takeIf { it.isNotEmpty() }
    if (requestedTag != null) {
      val requestedLocale = if (requestedTag.contains("-") || requestedTag.contains("_")) {
        Locale.forLanguageTag(requestedTag.replace('_', '-'))
      } else {
        Locale(requestedTag)
      }
      val avail = textToSpeech.isLanguageAvailable(requestedLocale)
      val chosenLocale = if (
        avail != TextToSpeech.LANG_MISSING_DATA &&
        avail != TextToSpeech.LANG_NOT_SUPPORTED
      ) {
        requestedLocale
      } else {
        val baseLocale = Locale(requestedLocale.language)
        val baseAvail = textToSpeech.isLanguageAvailable(baseLocale)
        if (
          baseAvail != TextToSpeech.LANG_MISSING_DATA &&
          baseAvail != TextToSpeech.LANG_NOT_SUPPORTED
        ) {
          baseLocale
        } else {
          null
        }
      }
      if (chosenLocale == null) {
        sendEvent(speakingErrorEvent, idToMap(id))
        return
      }
      textToSpeech.language = chosenLocale
    } else {
      textToSpeech.language = Locale.getDefault()
    }

    options.voice?.let { voiceName ->
      textToSpeech.voices
        ?.firstOrNull { it.name == voiceName }
        ?.let(textToSpeech::setVoice)
    }

    val status = textToSpeech.speak(
      text,
      TextToSpeech.QUEUE_ADD,
      null,
      id
    )
    if (status == TextToSpeech.ERROR) {
      sendEvent(speakingErrorEvent, idToMap(id))
    }
  }

  private val isTextToSpeechReady
    get() = _ttsReady && _textToSpeech != null

  private val textToSpeech: TextToSpeech
    get() = getOrInitTts()

  private fun getOrInitTts(): TextToSpeech {
    _textToSpeech?.let { return it }
    synchronized(this@SpeechModule) {
      _textToSpeech?.let { return it }
      var initFailed = false
      lateinit var newTtsInstance: TextToSpeech
      newTtsInstance = TextToSpeech(appContext.reactContext) { status: Int ->
        if (status == TextToSpeech.SUCCESS) {
          synchronized(this@SpeechModule) {
            if (_textToSpeech != null && _textToSpeech !== newTtsInstance) return@synchronized
            _textToSpeech = newTtsInstance
            _ttsReady = true
            newTtsInstance.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
              override fun onStart(utteranceId: String) {
                sendEvent(speakingStartedEvent, idToMap(utteranceId))
              }

              override fun onRangeStart(utteranceId: String, start: Int, end: Int, frame: Int) {
                val map = Bundle().apply {
                  putString("id", utteranceId)
                  putInt("charIndex", start)
                  putInt("charLength", end - start)
                }
                sendEvent(speakingWillSayNextStringEvent, map)
              }

              override fun onDone(utteranceId: String) {
                sendEvent(speakingDoneEvent, idToMap(utteranceId))
              }

              override fun onStop(utteranceId: String, interrupted: Boolean) {
                sendEvent(speakingStoppedEvent, idToMap(utteranceId))
              }

              override fun onError(utteranceId: String) {
                sendEvent(speakingErrorEvent, idToMap(utteranceId))
              }
            })
            for ((id, text, options) in delayedUtterances) {
              speakOut(id, text, options)
            }
            delayedUtterances.clear()
            for (promise in delayedGetVoices) {
              try {
                promise.resolve(getVoices())
              } catch (err: Exception) {
                promise.reject(SpeechUnableToGetVoicesException(err))
              }
            }
            delayedGetVoices.clear()
          }
        } else {
          synchronized(this@SpeechModule) {
            initFailed = true
            if (_textToSpeech === newTtsInstance) {
              _ttsReady = false
              _textToSpeech = null
            }
            for ((id, _, _) in delayedUtterances) {
              sendEvent(speakingErrorEvent, idToMap(id))
            }
            delayedUtterances.clear()
            for (promise in delayedGetVoices) {
              promise.reject(SpeechUnableToGetVoicesException())
            }
            delayedGetVoices.clear()
          }
        }
      }
      if (!initFailed) {
        _textToSpeech = newTtsInstance
      }
      return newTtsInstance
    }
  }

  private fun idToMap(id: String) = Bundle().apply {
    putString("id", id)
  }

  private data class Utterance(
    val id: String,
    val text: String,
    val options: SpeechOptions
  )

  private var _textToSpeech: TextToSpeech? = null
  private var _ttsReady = false
}
`;

const LANGUAGE_UTILS_KT = `package expo.modules.speech

import java.util.*

object LanguageUtils {
  private val countryISOCodes: Map<String, Locale> by lazy {
    Locale.getISOCountries().associate { country ->
      val locale = Locale("", country)
      locale.isO3Country.uppercase(locale) to locale
    }
  }
  private val languageISOCodes: Map<String, Locale> by lazy {
    Locale.getISOLanguages().associate { language ->
      val locale = Locale(language)
      locale.isO3Language to locale
    }
  }

  private fun transformCountryISO(code: String) = countryISOCodes[code]?.country ?: ""
  private fun transformLanguageISO(code: String) = languageISOCodes[code]?.language ?: ""

  fun getISOCode(locale: Locale): String {
    return try {
      var language = transformLanguageISO(locale.isO3Language).ifEmpty { locale.language }
      val country = locale.isO3Country
      if (country.isNotEmpty()) {
        val countryCode = transformCountryISO(country).ifEmpty { locale.country }
        if (countryCode.isNotEmpty()) {
          language += "-$countryCode"
        }
      }
      language
    } catch (_: Exception) {
      locale.toLanguageTag()
    }
  }
}
`;

module.exports = function withReliableAndroidSpeech(config) {
  return withDangerousMod(config, ['android', (cfg) => {
    const speechRoot = path.join(cfg.modRequest.projectRoot, 'node_modules', 'expo-speech');
    if (!fs.existsSync(speechRoot)) return cfg;

    const moduleConfigPath = path.join(speechRoot, 'expo-module.config.json');
    if (fs.existsSync(moduleConfigPath)) {
      const moduleConfig = JSON.parse(fs.readFileSync(moduleConfigPath, 'utf8'));
      if (moduleConfig.android && 'publication' in moduleConfig.android) {
        delete moduleConfig.android.publication;
        fs.writeFileSync(moduleConfigPath, `${JSON.stringify(moduleConfig, null, 2)}\n`);
      }
    }

    const srcDir = path.join(speechRoot, 'android', 'src', 'main', 'java', 'expo', 'modules', 'speech');
    if (fs.existsSync(srcDir)) {
      fs.writeFileSync(path.join(srcDir, 'SpeechModule.kt'), SPEECH_MODULE_KT);
      fs.writeFileSync(path.join(srcDir, 'LanguageUtils.kt'), LANGUAGE_UTILS_KT);
    }

    console.log('[withReliableAndroidSpeech] Configured expo-speech source build with init/language/error safeguards');
    return cfg;
  }]);
};
