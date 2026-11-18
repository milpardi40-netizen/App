package expo.modules.miloapkverifier

import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.pm.Signature
import android.net.Uri
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.security.MessageDigest
import java.util.zip.ZipFile

/** Preflight only. Android's package installer remains the authority on installation. */
@Suppress("DEPRECATION") // GET_SIGNATURES/versionCode are still needed on Android 7 and 8.
class MiloApkVerifierModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MiloApkVerifier")

    AsyncFunction("check") { uri: String, expectedCode: Int, expectedSha256: String? ->
      try {
        checkArchive(uri, expectedCode, expectedSha256)
      } catch (_: Exception) {
        "invalid"
      }
    }
  }

  private fun checkArchive(uri: String, expectedCode: Int, expectedSha256: String?): String {
    val context = appContext.reactContext ?: return "invalid"
    val parsed = Uri.parse(uri)
    if (parsed.scheme != "file") return "invalid"
    val file = File(parsed.path ?: return "invalid").canonicalFile
    if (file.parentFile != File(appContext.cacheDirectory, "updates").canonicalFile || !file.isFile || file.length() == 0L) return "invalid"
    // Stream on the module's async queue; never send a 40 MB byte array across the JS bridge.
    if (expectedSha256 != null && !sha256(file).equals(expectedSha256, ignoreCase = true)) return "digest"
    val pm = context.packageManager
    val flags = if (Build.VERSION.SDK_INT >= 28) PackageManager.GET_SIGNING_CERTIFICATES else PackageManager.GET_SIGNATURES
    val archive = pm.getPackageArchiveInfo(file.path, flags) ?: return "invalid"
    if (archive.packageName != context.packageName) return "package"
    val installed = pm.getPackageInfo(context.packageName, flags)
    val code = versionCode(archive)
    if (code != expectedCode.toLong() || code <= versionCode(installed)) return "version"
    val archiveSigners = signers(archive)
    if (archiveSigners.isEmpty() || archiveSigners != signers(installed)) return "signer"
    if ((archive.applicationInfo?.minSdkVersion ?: 0) > Build.VERSION.SDK_INT) return "sdk"
    val abis = ZipFile(file).use { zip ->
      zip.entries().asSequence().map { it.name }.filter { it.startsWith("lib/") && it.endsWith(".so") }
        .map { it.split('/')[1] }.toSet()
    }
    if (abis.isNotEmpty() && Build.SUPPORTED_ABIS.none { it in abis }) return "abi"
    return "ok"
  }

  private fun versionCode(info: PackageInfo) = if (Build.VERSION.SDK_INT >= 28) info.longVersionCode else info.versionCode.toLong()

  private fun signers(info: PackageInfo): Set<Signature> =
    (if (Build.VERSION.SDK_INT >= 28) info.signingInfo?.apkContentsSigners else info.signatures)?.toSet().orEmpty()

  private fun sha256(file: File): String {
    val digest = MessageDigest.getInstance("SHA-256")
    file.inputStream().use { stream ->
      val buffer = ByteArray(65536)
      var count = stream.read(buffer)
      while (count != -1) {
        digest.update(buffer, 0, count)
        count = stream.read(buffer)
      }
    }
    return digest.digest().joinToString("") { "%02x".format(it) }
  }
}
