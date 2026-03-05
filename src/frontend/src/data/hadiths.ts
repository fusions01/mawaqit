export interface Hadith {
  text: string;
  arabic?: string;
  source: string;
  narrator?: string;
}

export const HADITHS: Hadith[] = [
  {
    text: "The best of you are those who learn the Quran and teach it.",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    source: "Sahih Al-Bukhari",
    narrator: "Uthman ibn Affan (RA)",
  },
  {
    text: "Actions are judged by intentions, and every person will get what they intended.",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
    source: "Sahih Al-Bukhari & Muslim",
    narrator: "Umar ibn Al-Khattab (RA)",
  },
  {
    text: "The strong man is not the one who can overpower others; the strong man is the one who controls himself when angry.",
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    source: "Sahih Al-Bukhari & Muslim",
    narrator: "Abu Huraira (RA)",
  },
  {
    text: "None of you truly believes until he loves for his brother what he loves for himself.",
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    source: "Sahih Al-Bukhari & Muslim",
    narrator: "Anas ibn Malik (RA)",
  },
  {
    text: "Seek knowledge from the cradle to the grave.",
    source: "Ibn Abd al-Barr",
    narrator: "Attributed to the Prophet ﷺ",
  },
  {
    text: "The best among you are those who have the best manners and character.",
    arabic: "إِنَّ مِنْ خِيَارِكُمْ أَحْسَنَكُمْ أَخْلَاقًا",
    source: "Sahih Al-Bukhari",
    narrator: "Abdullah ibn Amr (RA)",
  },
  {
    text: "Make things easy and do not make them difficult. Cheer people up and do not drive them away.",
    arabic: "يَسِّرُوا وَلَا تُعَسِّرُوا وَبَشِّرُوا وَلَا تُنَفِّرُوا",
    source: "Sahih Al-Bukhari",
    narrator: "Anas ibn Malik (RA)",
  },
  {
    text: "Smiling in the face of your brother is an act of charity (sadaqah).",
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    source: "Jami' At-Tirmidhi",
    narrator: "Abu Dharr (RA)",
  },
  {
    text: "A Muslim is the one from whose tongue and hands other Muslims are safe.",
    arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    source: "Sahih Al-Bukhari",
    narrator: "Abdullah ibn Amr (RA)",
  },
  {
    text: "Pay the worker his wage before his sweat dries.",
    arabic: "أَعْطُوا الأَجِيرَ أَجْرَهُ قَبْلَ أَنْ يَجِفَّ عَرَقُهُ",
    source: "Sunan Ibn Majah",
    narrator: "Abdullah ibn Umar (RA)",
  },
  {
    text: "Whoever believes in Allah and the Last Day should speak good or keep silent.",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    source: "Sahih Al-Bukhari & Muslim",
    narrator: "Abu Huraira (RA)",
  },
  {
    text: "The most beloved deeds to Allah are those done regularly, even if small.",
    arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ تَعَالَى أَدْوَمُهَا وَإِنْ قَلَّ",
    source: "Sahih Al-Bukhari & Muslim",
    narrator: "Aisha (RA)",
  },
  {
    text: "Whoever is humble for the sake of Allah, Allah will raise his rank.",
    arabic: "مَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلَّا رَفَعَهُ اللَّهُ",
    source: "Sahih Muslim",
    narrator: "Abu Huraira (RA)",
  },
  {
    text: "Feed the hungry, visit the sick, and free the captive.",
    arabic: "أَطْعِمُوا الْجَائِعَ، وَعُودُوا الْمَرِيضَ، وَفُكُّوا الْعَانِيَ",
    source: "Sahih Al-Bukhari",
    narrator: "Abu Musa Al-Ash'ari (RA)",
  },
  {
    text: "The world is a prison for the believer and a paradise for the disbeliever.",
    arabic: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ",
    source: "Sahih Muslim",
    narrator: "Abu Huraira (RA)",
  },
  {
    text: "Allah does not judge you by your appearance or wealth, but by your hearts and deeds.",
    arabic: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
    source: "Sahih Muslim",
    narrator: "Abu Huraira (RA)",
  },
  {
    text: "Removing a harmful object from the road is an act of charity.",
    source: "Sahih Al-Bukhari & Muslim",
    narrator: "Abu Huraira (RA)",
  },
  {
    text: "He who does not thank people does not thank Allah.",
    arabic: "لَا يَشْكُرُ اللَّهَ مَنْ لَا يَشْكُرُ النَّاسَ",
    source: "Sunan Abu Dawud",
    narrator: "Abu Huraira (RA)",
  },
  {
    text: "The merciful are shown mercy by the Most Merciful. Show mercy to those on earth, and He who is in the sky will show mercy to you.",
    arabic: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ",
    source: "Jami' At-Tirmidhi",
    narrator: "Abdullah ibn Amr (RA)",
  },
  {
    text: "Kindness is a mark of faith; whoever lacks kindness lacks faith.",
    arabic: "الرِّفْقُ لَا يَكُونُ فِي شَيْءٍ إِلَّا زَانَهُ، وَلَا يُنْزَعُ مِنْ شَيْءٍ إِلَّا شَانَهُ",
    source: "Sahih Muslim",
    narrator: "Aisha (RA)",
  },
  {
    text: "The most perfect of the believers in faith are those with the best character among them.",
    source: "Sunan Abu Dawud",
    narrator: "Abu Huraira (RA)",
  },
  {
    text: "Take advantage of five before five: your youth before old age, health before illness, wealth before poverty, free time before preoccupation, and life before death.",
    source: "Shu'ab al-Iman",
    narrator: "Ibn Abbas (RA)",
  },
  {
    text: "Whoever guides someone to goodness will have a reward like the one who did it.",
    arabic: "مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ",
    source: "Sahih Muslim",
    narrator: "Abu Mas'ud Al-Ansari (RA)",
  },
  {
    text: "No fatigue, nor disease, nor sorrow, nor sadness, nor hurt, nor distress befalls a Muslim — not even a thorn that pricks him — except that Allah will expiate some of his sins.",
    source: "Sahih Al-Bukhari",
    narrator: "Abu Sa'id & Abu Huraira (RA)",
  },
  {
    text: "The pen has been lifted and the pages have dried.",
    arabic: "رُفِعَ الْقَلَمُ وَجَفَّتِ الصُّحُفُ",
    source: "Jami' At-Tirmidhi",
    narrator: "Ibn Abbas (RA)",
  },
  {
    text: "Speak the truth even if it is bitter.",
    arabic: "قُلِ الْحَقَّ وَلَوْ كَانَ مُرًّا",
    source: "Musnad Ahmad",
    narrator: "Abu Dharr (RA)",
  },
  {
    text: "Richness does not come from having more money but from a content heart.",
    arabic: "لَيْسَ الْغِنَى عَنْ كَثْرَةِ الْعَرَضِ وَلَكِنَّ الْغِنَى غِنَى النَّفْسِ",
    source: "Sahih Al-Bukhari & Muslim",
    narrator: "Abu Huraira (RA)",
  },
  {
    text: "Whoever calls people to guidance will have a reward like the reward of those who follow it.",
    source: "Sahih Muslim",
    narrator: "Abu Huraira (RA)",
  },
  {
    text: "Beware of envy! For envy devours good deeds just as fire devours wood.",
    arabic: "إِيَّاكُمْ وَالْحَسَدَ فَإِنَّ الْحَسَدَ يَأْكُلُ الْحَسَنَاتِ كَمَا تَأْكُلُ النَّارُ الْحَطَبَ",
    source: "Sunan Abu Dawud",
    narrator: "Abu Huraira (RA)",
  },
  {
    text: "Cleanliness is half of faith.",
    arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ",
    source: "Sahih Muslim",
    narrator: "Abu Malik Al-Ash'ari (RA)",
  },
];

export function getDailyHadith(date: Date = new Date()): {
  hadith: Hadith;
  index: number;
} {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const index = dayOfYear % HADITHS.length;
  return { hadith: HADITHS[index], index };
}
