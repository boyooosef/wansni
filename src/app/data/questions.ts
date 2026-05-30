import { Category } from '../types';
import kuwaitData from '../../imports/kuwait.json';
import riddlesData from '../../imports/riddles.json';
import proverbsData from '../../imports/proverbs.json';
import challengesData from '../../imports/challenges.json';
import speedData from '../../imports/speed.json';
import wouldyouratherData from '../../imports/wouldyourather.json';
import truthData from '../../imports/truth.json';
import challengeplusData from '../../imports/challengeplus.json';
import religionData from '../../imports/religion.json';
import kuwaitArtData from '../../imports/kuwaitArt.json';

export const categories: Record<string, Category> = {
  kuwait: {
    name: "معلومات عن الكويت 🇰🇼",
    time: 30,
    questions: kuwaitData
  },
  riddles: {
    name: "ألغاز 🧠",
    time: 30,
    questions: riddlesData
  },
  proverbs: {
    name: "أمثال كويتية 🎭",
    time: 20,
    questions: proverbsData
  },
  challenges: {
    name: "تحديات 🔥",
    time: 20,
    questions: challengesData
  },
  speed: {
    name: "سرعة بديهة ⚡",
    time: 10,
    questions: speedData
  },
  wouldyourather: {
    name: "🤔 تختار شنو؟",
    time: 15,
    questions: wouldyouratherData
  },
  truth: {
    name: "😳 الصراحة",
    time: 20,
    questions: truthData
  },
  challengeplus: {
    name: "🔥 تحديات أقوى",
    time: 20,
    questions: challengeplusData
  },
  religion: {
    name: "أسئلة دينية 🕌",
    time: 30,
    questions: religionData
  },
  kuwaitArt: {
    name: "الفن الكويتي 🎬",
    time: 30,
    questions: kuwaitArtData
  }
};

export const avatars = ["😎","😂","🤖","👑","🦁","🐺","🐵","🧠","🔥","⚡","🎭","🕶️"];
