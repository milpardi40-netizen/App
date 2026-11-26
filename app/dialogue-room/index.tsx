import { Redirect } from 'expo-router';
import { readResumeSnapshot } from '@/lib/appResume';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';

/**
 * Bare «/dialogue-room» entry: route it to the learner's own language from the
 * resume snapshot (or English) so no URL shape of the room is a dead end.
 */
export default function DialogueRoomIndex() {
  const [lang, setLang] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    readResumeSnapshot()
      .then(snapshot => {
        if (!alive) return;
        const language = snapshot?.language;
        setLang(language && language !== 'en' ? language : 'en');
      })
      .catch(() => { if (alive) setLang('en'); });
    return () => { alive = false; };
  }, []);

  if (!lang) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.canvas }}>
        <ActivityIndicator color={Palette.primary} size="large" />
      </View>
    );
  }
  return <Redirect href={`/dialogue-room/${lang}`} />;
}
