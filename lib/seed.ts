import type { Issue } from "./types";
import { assetPath } from "./assets";

/** Jayanagar 4th Block, Bengaluru — compact enough for ward-level zoom. */
export const WARD_CENTER: [number, number] = [12.9254, 77.5838];

const roadTimeline = [
  { status: "reported" as const, labelEn: "Submitted", labelHi: "जमा हुई", date: "18 Aug · 08:42", noteEn: "Photo and location added", noteHi: "फोटो और जगह जोड़ी गई" },
  { status: "acknowledged" as const, labelEn: "Under review", labelHi: "समीक्षा में", date: "18 Aug · 10:16", noteEn: "Assigned to the responsible team", noteHi: "जिम्मेदार टीम को सौंपा गया" },
  { status: "in_progress" as const, labelEn: "Work in progress", labelHi: "काम चल रहा है", date: "20 Aug · 09:30", noteEn: "Work has started", noteHi: "काम शुरू हो गया है" },
];

const rawSeedIssues: Issue[] = [
  {
    id: "PK-14028", category: "Roads", titleEn: "Deep pothole at 36th Cross turn", titleHi: "36वीं क्रॉस मोड़ पर गहरा गड्ढा", descriptionEn: "Large road cavity near the bus turn; risky for two-wheelers after rain.", descriptionHi: "बस मोड़ के पास बड़ा गड्ढा; बारिश के बाद दोपहिया वाहनों के लिए खतरनाक।", address: "36th Cross, 4th Block", lat: 12.9254, lng: 77.5838, image: "/images/pothole-ambedkar.jpg", supporters: 31, aliases: ["Riya M.", "A neighbour", "Kabir S."], status: "in_progress", severity: "high", reportedAgoEn: "10 days ago", reportedAgoHi: "10 दिन पहले", departmentEn: "Roads · Public Works Department", departmentHi: "सड़क · लोक निर्माण विभाग", roleEn: "Junior Engineer, Ward 14", roleHi: "कनिष्ठ अभियंता, वार्ड 14", escalationEn: "Assistant Engineer · engineer@ward14.demo", escalationHi: "सहायक अभियंता · engineer@ward14.demo", expectedEn: "3 Sep · 4 days remaining", expectedHi: "3 सितम्बर · 4 दिन बाकी", overdueDays: 0, mine: true, timeline: roadTimeline,
  },
  {
    id: "PK-14019", category: "Waste", titleEn: "Garbage piling beside 4th Block market", titleHi: "चौथा ब्लॉक बाज़ार के पास कचरे का ढेर", descriptionEn: "Mixed waste has blocked part of the footpath.", descriptionHi: "मिश्रित कचरे ने फुटपाथ का हिस्सा रोक दिया है।", address: "4th Block Complex", lat: 12.9271, lng: 77.5811, image: "/images/waste-sabzi-mandi.jpg", supporters: 9, aliases: ["A neighbour", "Meera"], status: "contested", severity: "medium", reportedAgoEn: "6 days ago", reportedAgoHi: "6 दिन पहले", departmentEn: "Sanitation · BBMP", departmentHi: "स्वच्छता · बीबीएमपी", roleEn: "Sanitary Inspector, Ward 14", roleHi: "स्वच्छता निरीक्षक, वार्ड 14", escalationEn: "Zonal Sanitation Officer · 1800-14-0014", escalationHi: "क्षेत्रीय स्वच्छता अधिकारी · 1800-14-0014", expectedEn: "Overdue by 2 days", expectedHi: "2 दिन की देरी", overdueDays: 2, timeline: [...roadTimeline.slice(0, 2), { status: "awaiting_confirmation", labelEn: "Resolved", labelHi: "ठीक बताया गया", date: "23 Aug · 16:20" }, { status: "contested", labelEn: "Reopened by a resident", labelHi: "निवासी ने फिर खोला", date: "24 Aug · 08:12", noteEn: "New photo shows the waste is still there", noteHi: "नई फोटो में कचरा अभी भी है" }],
  },
  {
    id: "PK-14033", category: "Drainage", titleEn: "Clogged open drain near 9th Main", titleHi: "9वीं मेन के पास भरी नाली", descriptionEn: "The open drain is choked with floating waste on the school route.", descriptionHi: "स्कूल जाने वाले रास्ते पर खुली नाली कचरे से जाम है।", address: "9th Main, 4th T Block", lat: 12.9232, lng: 77.5857, image: "/images/drain-kabir-basti.jpg", supporters: 4, aliases: ["A neighbour"], status: "acknowledged", severity: "high", reportedAgoEn: "2 days ago", reportedAgoHi: "2 दिन पहले", departmentEn: "Drainage · Municipal Engineering", departmentHi: "जल निकासी · नगर अभियांत्रिकी", roleEn: "Works Supervisor, Ward 14", roleHi: "कार्य पर्यवेक्षक, वार्ड 14", escalationEn: "Ward Engineer · 1800-14-0014", escalationHi: "वार्ड अभियंता · 1800-14-0014", expectedEn: "30 Aug · tomorrow", expectedHi: "30 अगस्त · कल", timeline: roadTimeline.slice(0, 2),
  },
  {
    id: "PK-14011", category: "Lighting", titleEn: "Park road stays dark after sunset", titleHi: "सूर्यास्त के बाद पार्क वाली सड़क अंधेरी", descriptionEn: "The stretch by Madhavan Park has little usable light at night.", descriptionHi: "माधवन पार्क वाली सड़क रात में लगभग अंधेरी रहती है।", address: "Madhavan Park", lat: 12.9283, lng: 77.5863, image: "/images/light-community-park.jpg", supporters: 12, aliases: ["Dev", "A neighbour"], status: "confirmed", severity: "medium", reportedAgoEn: "21 days ago", reportedAgoHi: "21 दिन पहले", departmentEn: "Street Lighting · BBMP", departmentHi: "सड़क प्रकाश · बीबीएमपी", roleEn: "Electrical Supervisor", roleHi: "विद्युत पर्यवेक्षक", escalationEn: "Ward Engineer · 1800-14-0014", escalationHi: "वार्ड अभियंता · 1800-14-0014", expectedEn: "Completed 24 Aug", expectedHi: "24 अगस्त को पूरा", timeline: [...roadTimeline, { status: "awaiting_confirmation", labelEn: "Check the fix", labelHi: "मरम्मत जाँचें", date: "23 Aug · 18:10" }, { status: "confirmed", labelEn: "Confirmed by residents", labelHi: "निवासियों ने पुष्टि की", date: "24 Aug · 20:04" }],
  },
  {
    id: "PK-14037", category: "Water", titleEn: "Leaking pipe outside ration shop", titleHi: "राशन दुकान के बाहर पाइप लीक", descriptionEn: "Clean water has been running into the street since morning.", descriptionHi: "सुबह से साफ पानी सड़क पर बह रहा है।", address: "32nd Cross", lat: 12.9211, lng: 77.5818, image: "/images/water.svg", supporters: 7, aliases: ["A neighbour"], status: "reported", severity: "medium", reportedAgoEn: "4 hours ago", reportedAgoHi: "4 घंटे पहले", departmentEn: "Water Supply · BWSSB", departmentHi: "जल आपूर्ति · बीडब्ल्यूएसएसबी", roleEn: "Area Maintenance Supervisor", roleHi: "क्षेत्र रखरखाव पर्यवेक्षक", escalationEn: "Zone Control Room · 1800-14-0014", escalationHi: "क्षेत्र नियंत्रण कक्ष · 1800-14-0014", expectedEn: "Check within 24 hours", expectedHi: "24 घंटे में जाँच", timeline: roadTimeline.slice(0, 1),
  },
  {
    id: "PK-14025", category: "Waste", titleEn: "Uncollected waste dumped near metro gate", titleHi: "मेट्रो गेट के पास कचरे का ढेर", descriptionEn: "Household waste has been dumped on the street beside the collection point.", descriptionHi: "संग्रह बिंदु के पास सड़क पर घरेलू कचरा डाला गया है।", address: "Jayanagar Metro Gate 2", lat: 12.9255, lng: 77.5802, image: "/images/waste-metro-gate.jpg", supporters: 18, aliases: ["Zoya", "A neighbour"], status: "awaiting_confirmation", severity: "medium", reportedAgoEn: "8 days ago", reportedAgoHi: "8 दिन पहले", departmentEn: "Sanitation · BBMP", departmentHi: "स्वच्छता · बीबीएमपी", roleEn: "Sanitary Inspector, Ward 14", roleHi: "स्वच्छता निरीक्षक, वार्ड 14", escalationEn: "Zonal Sanitation Officer · 1800-14-0014", escalationHi: "क्षेत्रीय स्वच्छता अधिकारी · 1800-14-0014", expectedEn: "Marked complete today", expectedHi: "आज पूरा बताया गया", mine: true, timeline: [...roadTimeline, { status: "awaiting_confirmation", labelEn: "Check the fix", labelHi: "मरम्मत जाँचें", date: "Today · 11:20", noteEn: "The team added a completion photo", noteHi: "टीम ने पूरा होने की फोटो जोड़ी" }],
  },
];

export const seedIssues: Issue[] = rawSeedIssues.map((issue) => ({
  ...issue,
  image: assetPath(issue.image),
}));
