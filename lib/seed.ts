import type { Issue, StatusEvent, TrustFilter } from "./types";
import { assetPath } from "./assets";
import { WARD_CENTER } from "./geo";

export { WARD_CENTER };

const roadTimeline: StatusEvent[] = [
  { status: "reported", labelEn: "Submitted", labelHi: "जमा हुई", labelKn: "ಸಲ್ಲಿಸಲಾಗಿದೆ", date: "18 Aug · 08:42", noteEn: "Photo and location added", noteHi: "फोटो और जगह जोड़ी गई", noteKn: "ಫೋಟೋ ಮತ್ತು ಸ್ಥಳ ಸೇರಿಸಲಾಗಿದೆ" },
  { status: "acknowledged", labelEn: "Under review", labelHi: "समीक्षा में", labelKn: "ಪರಿಶೀಲನೆಯಲ್ಲಿ", date: "18 Aug · 10:16", noteEn: "Assigned to the responsible team", noteHi: "जिम्मेदार टीम को सौंपा गया", noteKn: "ಜವಾಬ್ದಾರ ತಂಡಕ್ಕೆ ನಿಯೋಜಿಸಲಾಗಿದೆ" },
  { status: "in_progress", labelEn: "Work in progress", labelHi: "काम चल रहा है", labelKn: "ಕೆಲಸ ನಡೆಯುತ್ತಿದೆ", date: "20 Aug · 09:30", noteEn: "Work has started", noteHi: "काम शुरू हो गया है", noteKn: "ಕೆಲಸ ಶುರುವಾಗಿದೆ" },
];

function trustFor(status: Issue["status"], supporters: number): TrustFilter[] {
  const flags: TrustFilter[] = [];
  if (status === "acknowledged" || status === "in_progress" || status === "awaiting_confirmation" || status === "confirmed") flags.push("gov");
  if (supporters >= 8 || status === "confirmed") flags.push("community");
  return flags;
}

const rawSeedIssues: Issue[] = [
  {
    id: "FX-14028", category: "Roads", titleEn: "Deep pothole at 36th Cross turn", titleHi: "36वीं क्रॉस मोड़ पर गहरा गड्ढा", titleKn: "36ನೇ ಕ್ರಾಸ್ ತಿರುವಿನಲ್ಲಿ ಆಳವಾದ ಗುಂಡಿ",
    descriptionEn: "Large road cavity near the bus turn; risky for two-wheelers after rain.", descriptionHi: "बस मोड़ के पास बड़ा गड्ढा; बारिश के बाद दोपहिया वाहनों के लिए खतरनाक।", descriptionKn: "ಬಸ್ ತಿರುವಿನ ಬಳಿ ದೊಡ್ಡ ಗುಂಡಿ; ಮಳೆಯ ನಂತರ ದ್ವಿಚಕ್ರ ವಾಹನಗಳಿಗೆ ಅಪಾಯ.",
    address: "36th Cross and 11th Main", lat: 12.9252, lng: 77.5888, image: "/images/issue-roads-pothole-01.jpg", supporters: 31, aliases: ["Riya M.", "A neighbour", "Kabir S."], status: "in_progress", severity: "high",
    reportedAgoEn: "10 days ago", reportedAgoHi: "10 दिन पहले", reportedAgoKn: "10 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-18T08:42:00+05:30", updatedAt: "2026-08-27T10:20:00+05:30",
    departmentEn: "Roads Engineering Department", departmentHi: "सड़क अभियांत्रिकी विभाग", departmentKn: "ರಸ್ತೆ ಎಂಜಿನಿಯರಿಂಗ್ ಇಲಾಖೆ",
    roleEn: "Assistant Executive Engineer", roleHi: "सहायक कार्यपालक अभियंता", roleKn: "ಸಹಾಯಕ ಕಾರ್ಯನಿರ್ವಾಹಕ ಎಂಜಿನಿಯರ್",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
    expectedEn: "3 Sep · 4 days remaining", expectedHi: "3 सितम्बर · 4 दिन बाकी", expectedKn: "3 ಸೆಪ್ಟೆಂಬರ್ · 4 ದಿನ ಬಾಕಿ", overdueDays: 0, mine: true, mergedCount: 4, trust: [], timeline: roadTimeline,
  },
  {
    id: "FX-14019", category: "Waste", titleEn: "Garbage piling beside 4th Block market", titleHi: "चौथा ब्लॉक बाज़ार के पास कचरे का ढेर", titleKn: "4ನೇ ಬ್ಲಾಕ್ ಮಾರುಕಟ್ಟೆ ಬಳಿ ತ್ಯಾಜ್ಯ ರಾಶಿ",
    descriptionEn: "Mixed waste has blocked part of the footpath.", descriptionHi: "मिश्रित कचरे ने फुटपाथ का हिस्सा रोक दिया है।", descriptionKn: "ಮಿಶ್ರ ತ್ಯಾಜ್ಯವು ಕಾಲುದಾರಿಯ ಭಾಗವನ್ನು ತಡೆದಿದೆ.",
    address: "4th Main, 4th Block", lat: 12.9260, lng: 77.5785, image: "/images/issue-waste-roadside-01.jpg", supporters: 9, aliases: ["A neighbour", "Meera"], status: "contested", severity: "medium",
    reportedAgoEn: "6 days ago", reportedAgoHi: "6 दिन पहले", reportedAgoKn: "6 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-21T09:10:00+05:30", updatedAt: "2026-08-24T08:12:00+05:30",
    departmentEn: "Solid Waste Management", departmentHi: "ठोस अपशिष्ट प्रबंधन", departmentKn: "ಘನ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ",
    roleEn: "Sanitary Inspector", roleHi: "स्वच्छता निरीक्षक", roleKn: "ನೈರ್ಮಲ್ಯ ನಿರೀಕ್ಷಕ",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
    expectedEn: "Overdue by 2 days", expectedHi: "2 दिन की देरी", expectedKn: "2 ದಿನ ವಿಳಂಬ", overdueDays: 2, trust: [],
    timeline: [...roadTimeline.slice(0, 2), { status: "awaiting_confirmation", labelEn: "Resolved", labelHi: "ठीक बताया गया", labelKn: "ಸರಿಪಡಿಸಲಾಗಿದೆ ಎನ್ನಲಾಗಿದೆ", date: "23 Aug · 16:20" }, { status: "contested", labelEn: "Reopened by a resident", labelHi: "निवासी ने फिर खोला", labelKn: "ನಿವಾಸಿ ಮತ್ತೆ ತೆರೆದಿದ್ದಾರೆ", date: "24 Aug · 08:12", noteEn: "New photo shows the waste is still there", noteHi: "नई फोटो में कचरा अभी भी है", noteKn: "ಹೊಸ ಫೋಟೋದಲ್ಲಿ ತ್ಯಾಜ್ಯ ಇನ್ನೂ ಇದೆ" }],
  },
  {
    id: "FX-14033", category: "Drainage", titleEn: "Clogged open drain near 9th Main", titleHi: "9वीं मेन के पास भरी नाली", titleKn: "9ನೇ ಮೇನ್ ಬಳಿ ತುಂಬಿದ ತೆರೆದ ಚರಂಡಿ",
    descriptionEn: "The open drain is choked with floating waste on the school route.", descriptionHi: "स्कूल जाने वाले रास्ते पर खुली नाली कचरे से जाम है।", descriptionKn: "ಶಾಲೆ ದಾರಿಯಲ್ಲಿ ತೆರೆದ ಚರಂಡಿ ತ್ಯಾಜ್ಯದಿಂದ ತುಂಬಿದೆ.",
    address: "9th Main, 4th T Block", lat: 12.9224, lng: 77.5874, image: "/images/issue-drain-open-01.jpg", supporters: 4, aliases: ["A neighbour"], status: "acknowledged", severity: "high",
    reportedAgoEn: "2 days ago", reportedAgoHi: "2 दिन पहले", reportedAgoKn: "2 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-25T07:40:00+05:30", updatedAt: "2026-08-25T11:00:00+05:30",
    departmentEn: "Municipal Engineering", departmentHi: "नगर अभियांत्रिकी", departmentKn: "ನಗರ ಎಂಜಿನಿಯರಿಂಗ್",
    roleEn: "Ward Engineer", roleHi: "वार्ड अभियंता", roleKn: "ವಾರ್ಡ್ ಎಂಜಿನಿಯರ್",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
    expectedEn: "30 Aug · tomorrow", expectedHi: "30 अगस्त · कल", expectedKn: "30 ಆಗಸ್ಟ್ · ನಾಳೆ", trust: [], timeline: roadTimeline.slice(0, 2),
  },
  {
    id: "FX-14011", category: "Lighting", titleEn: "Park road stays dark after sunset", titleHi: "सूर्यास्त के बाद पार्क वाली सड़क अंधेरी", titleKn: "ಸೂರ್ಯಾಸ್ತದ ನಂತರ ಉದ್ಯಾನ ರಸ್ತೆ ಕತ್ತಲೆ",
    descriptionEn: "The stretch by Madhavan Park has little usable light at night.", descriptionHi: "माधवन पार्क वाली सड़क रात में लगभग अंधेरी रहती है।", descriptionKn: "ಮಾಧವನ್ ಪಾರ್ಕ್ ಬಳಿಯ ರಸ್ತೆ ರಾತ್ರಿ ಬಹುತೇಕ ಕತ್ತಲೆಯಲ್ಲಿರುತ್ತದೆ.",
    address: "Madhavan Park", lat: 12.9283, lng: 77.5863, image: "/images/light-community-park.jpg", supporters: 12, aliases: ["Dev", "A neighbour"], status: "confirmed", severity: "medium",
    reportedAgoEn: "21 days ago", reportedAgoHi: "21 दिन पहले", reportedAgoKn: "21 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-06T19:10:00+05:30", updatedAt: "2026-08-24T20:04:00+05:30",
    departmentEn: "Electrical cell", departmentHi: "विद्युत प्रकोष्ठ", departmentKn: "ವಿದ್ಯುತ್ ವಿಭಾಗ",
    roleEn: "Electrical Supervisor", roleHi: "विद्युत पर्यवेक्षक", roleKn: "ವಿದ್ಯುತ್ ಮೇಲ್ವಿಚಾರಕ",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
    expectedEn: "Completed 24 Aug", expectedHi: "24 अगस्त को पूरा", expectedKn: "24 ಆಗಸ್ಟ್‌ರಂದು ಪೂರ್ಣ", trust: [],
    timeline: [...roadTimeline, { status: "awaiting_confirmation", labelEn: "Check the fix", labelHi: "मरम्मत जाँचें", labelKn: "ದುರಸ್ತಿ ಪರಿಶೀಲಿಸಿ", date: "23 Aug · 18:10" }, { status: "confirmed", labelEn: "Confirmed by residents", labelHi: "निवासियों ने पुष्टि की", labelKn: "ನಿವಾಸಿಗಳು ದೃಢಪಡಿಸಿದ್ದಾರೆ", date: "24 Aug · 20:04" }],
  },
  {
    id: "FX-14037", category: "Water", titleEn: "Leaking pipe outside ration shop", titleHi: "राशन दुकान के बाहर पाइप लीक", titleKn: "ರೇಷನ್ ಅಂಗಡಿ ಹೊರಗೆ ಪೈಪ್ ಸೋರಿಕೆ",
    descriptionEn: "Clean water has been running into the street since morning.", descriptionHi: "सुबह से साफ पानी सड़क पर बह रहा है।", descriptionKn: "ಬೆಳಿಗ್ಗಿನಿಂದ ಶುದ್ಧ ನೀರು ರಸ್ತೆಗೆ ಸೋರುತ್ತಿದೆ.",
    address: "32nd Cross", lat: 12.9211, lng: 77.5818, image: "/images/issue-roads-pothole-04.jpg", supporters: 7, aliases: ["A neighbour"], status: "reported", severity: "medium",
    reportedAgoEn: "4 hours ago", reportedAgoHi: "4 घंटे पहले", reportedAgoKn: "4 ಗಂಟೆಗಳ ಹಿಂದೆ", reportedAt: "2026-08-27T10:40:00+05:30", updatedAt: "2026-08-27T10:40:00+05:30",
    departmentEn: "Water supply maintenance", departmentHi: "जल आपूर्ति रखरखाव", departmentKn: "ನೀರು ಸರಬರಾಜು ನಿರ್ವಹಣೆ",
    roleEn: "Utility Engineer", roleHi: "उपयोगिता अभियंता", roleKn: "ಯುಟಿಲಿಟಿ ಎಂಜಿನಿಯರ್",
    escalationEn: "BWSSB control room · 1800-14-0014", escalationHi: "बीडब्ल्यूएसएसबी नियंत्रण कक्ष · 1800-14-0014", escalationKn: "ಬಿಡಬ್ಲ್ಯುಎಸ್‌ಎಸ್‌ಬಿ ನಿಯಂತ್ರಣ ಕೋಣೆ · 1800-14-0014",
    expectedEn: "Check within 24 hours", expectedHi: "24 घंटे में जाँच", expectedKn: "24 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ", routingPending: false, trust: [], timeline: roadTimeline.slice(0, 1),
  },
  {
    id: "FX-14025", category: "Waste", titleEn: "Uncollected waste dumped near metro gate", titleHi: "मेट्रो गेट के पास कचरे का ढेर", titleKn: "ಮೆಟ್ರೋ ಗೇಟ್ ಬಳಿ ಎತ್ತದ ತ್ಯಾಜ್ಯ",
    descriptionEn: "Household waste has been dumped on the street beside the collection point.", descriptionHi: "संग्रह बिंदु के पास सड़क पर घरेलू कचरा डाला गया है।", descriptionKn: "ಸಂಗ್ರಹ ಸ್ಥಳದ ಬಳಿ ರಸ್ತೆಯಲ್ಲಿ ಮನೆ ತ್ಯಾಜ್ಯ ಹಾಕಲಾಗಿದೆ.",
    address: "Jayanagar Metro Gate 2", lat: 12.9255, lng: 77.5802, image: "/images/issue-waste-sidewalk-01.jpg", supporters: 18, aliases: ["Zoya", "A neighbour"], status: "awaiting_confirmation", severity: "medium",
    reportedAgoEn: "8 days ago", reportedAgoHi: "8 दिन पहले", reportedAgoKn: "8 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-19T11:20:00+05:30", updatedAt: "2026-08-27T11:20:00+05:30",
    departmentEn: "Solid Waste Management", departmentHi: "ठोस अपशिष्ट प्रबंधन", departmentKn: "ಘನ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ",
    roleEn: "Sanitary Inspector", roleHi: "स्वच्छता निरीक्षक", roleKn: "ನೈರ್ಮಲ್ಯ ನಿರೀಕ್ಷಕ",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
    expectedEn: "Marked complete today", expectedHi: "आज पूरा बताया गया", expectedKn: "ಇಂದು ಪೂರ್ಣ ಎನ್ನಲಾಗಿದೆ", mine: true, trust: [],
    resolutionImage: "/images/issue-waste-sidewalk-after-01.png",
    timeline: [...roadTimeline, { status: "awaiting_confirmation", labelEn: "Check the fix", labelHi: "मरम्मत जाँचें", labelKn: "ದುರಸ್ತಿ ಪರಿಶೀಲಿಸಿ", date: "Today · 11:20", noteEn: "The team added a completion photo", noteHi: "टीम ने पूरा होने की फोटो जोड़ी", noteKn: "ತಂಡ ಪೂರ್ಣಗೊಂಡ ಫೋಟೋ ಸೇರಿಸಿದೆ" }],
  },
  {
    id: "FX-14041", category: "Roads", titleEn: "Cracked speed breaker near South End Circle", titleHi: "साउथ एंड सर्कल के पास टूटा स्पीड ब्रेकर", titleKn: "ಸೌತ್ ಎಂಡ್ ಸರ್ಕಲ್ ಬಳಿ ಒಡೆದ ಸ್ಪೀಡ್ ಬ್ರೇಕರ್",
    descriptionEn: "The speed breaker has split and the edge is sharp for two-wheelers.", descriptionHi: "स्पीड ब्रेकर टूट गया है और किनारा दोपहिया वाहनों के लिए तेज है।", descriptionKn: "ಸ್ಪೀಡ್ ಬ್ರೇಕರ್ ಒಡೆದಿದೆ ಮತ್ತು ಅಂಚು ದ್ವಿಚಕ್ರ ವಾಹನಗಳಿಗೆ ತೀಕ್ಷ್ಣವಾಗಿದೆ.",
    address: "South End Circle", lat: 12.9304, lng: 77.5842, image: "/images/issue-roads-pothole-02.jpg", supporters: 11, aliases: ["A neighbour"], status: "reported", severity: "medium",
    reportedAgoEn: "1 day ago", reportedAgoHi: "1 दिन पहले", reportedAgoKn: "1 ದಿನದ ಹಿಂದೆ", reportedAt: "2026-08-26T09:15:00+05:30", updatedAt: "2026-08-26T09:15:00+05:30",
    departmentEn: "Roads Engineering Department", departmentHi: "सड़क अभियांत्रिकी विभाग", departmentKn: "ರಸ್ತೆ ಎಂಜಿನಿಯರಿಂಗ್ ಇಲಾಖೆ",
    roleEn: "Assistant Executive Engineer", roleHi: "सहायक कार्यपालक अभियंता", roleKn: "ಸಹಾಯಕ ಕಾರ್ಯನಿರ್ವಾಹಕ ಎಂಜಿನಿಯರ್",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
    expectedEn: "Check within 48 hours", expectedHi: "48 घंटे में जाँच", expectedKn: "48 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ", trust: [], timeline: roadTimeline.slice(0, 1),
  },
  {
    id: "FX-14042", category: "Roads", titleEn: "Loose manhole cover beside 27th Cross", titleHi: "27वीं क्रॉस के पास ढीला मैनहोल कवर", titleKn: "27ನೇ ಕ್ರಾಸ್ ಬಳಿ ಸಡಿಲ ಮ್ಯಾನ್‌ಹೋಲ್ ಕವರ್",
    descriptionEn: "The cover shifts when buses pass and needs to be seated.", descriptionHi: "बस गुजरने पर कवर हिलता है।", descriptionKn: "ಬಸ್ ಹೋದಾಗ ಕವರ್ ಜರುಗುತ್ತದೆ.",
    address: "27th Cross", lat: 12.9190, lng: 77.5788, image: "/images/issue-roads-pothole-03.jpg", supporters: 8, aliases: ["Kabir S."], status: "acknowledged", severity: "high",
    reportedAgoEn: "3 days ago", reportedAgoHi: "3 दिन पहले", reportedAgoKn: "3 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-24T16:40:00+05:30", updatedAt: "2026-08-25T10:00:00+05:30",
    departmentEn: "Roads Engineering Department", departmentHi: "सड़क अभियांत्रिकी विभाग", departmentKn: "ರಸ್ತೆ ಎಂಜಿನಿಯರಿಂಗ್ ಇಲಾಖೆ",
    roleEn: "Assistant Executive Engineer", roleHi: "सहायक कार्यपालक अभियंता", roleKn: "ಸಹಾಯಕ ಕಾರ್ಯನಿರ್ವಾಹಕ ಎಂಜಿನಿಯರ್",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
    expectedEn: "1 Sep", expectedHi: "1 सितम्बर", expectedKn: "1 ಸೆಪ್ಟೆಂಬರ್", trust: [], timeline: roadTimeline.slice(0, 2),
  },
];

const issuePhotos: Record<Issue["category"], string[]> = {
  Roads: [
    "/images/issue-roads-pothole-01.jpg",
    "/images/issue-roads-pothole-02.jpg",
    "/images/issue-roads-pothole-03.jpg",
    "/images/issue-roads-pothole-04.jpg",
    "/images/issue-roads-pothole-05.jpg",
    "/images/issue-roads-pothole-06.jpg",
    "/images/issue-roads-pothole-07.jpg",
    "/images/issue-roads-pothole-08.jpg",
  ],
  Waste: [
    "/images/issue-waste-roadside-01.jpg",
    "/images/issue-waste-sidewalk-01.jpg",
    "/images/waste-metro-gate.jpg",
    "/images/waste-sabzi-mandi.jpg",
  ],
  Water: [
    "/images/issue-roads-pothole-04.jpg",
    "/images/issue-roads-pothole-08.jpg",
  ],
  Lighting: ["/images/light-community-park.jpg"],
  Drainage: [
    "/images/issue-drain-open-01.jpg",
    "/images/drain-kabir-basti.jpg",
    "/images/issue-roads-pothole-02.jpg",
  ],
  Traffic: [
    "/images/issue-roads-pothole-05.jpg",
    "/images/issue-roads-pothole-07.jpg",
  ],
  Parks: [
    "/images/issue-parks-tree-01.jpg",
    "/images/issue-parks-tree-02.jpg",
  ],
  Other: ["/images/issue-roads-pothole-06.jpg"],
};

function imageFor(category: Issue["category"], id: string) {
  const photos = issuePhotos[category];
  const n = Number.parseInt(id.replace(/\D/g, ""), 10) || 0;
  return photos[n % photos.length];
}

const teams: Record<Issue["category"], Pick<Issue, "departmentEn" | "departmentHi" | "departmentKn" | "roleEn" | "roleHi" | "roleKn" | "escalationEn" | "escalationHi" | "escalationKn">> = {
  Roads: {
    departmentEn: "Roads Engineering Department", departmentHi: "सड़क अभियांत्रिकी विभाग", departmentKn: "ರಸ್ತೆ ಎಂಜಿನಿಯರಿಂಗ್ ಇಲಾಖೆ",
    roleEn: "Assistant Executive Engineer", roleHi: "सहायक कार्यपालक अभियंता", roleKn: "ಸಹಾಯಕ ಕಾರ್ಯನಿರ್ವಾಹಕ ಎಂಜಿನಿಯರ್",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
  },
  Waste: {
    departmentEn: "Solid Waste Management", departmentHi: "ठोस अपशिष्ट प्रबंधन", departmentKn: "ಘನ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ",
    roleEn: "Sanitary Inspector", roleHi: "स्वच्छता निरीक्षक", roleKn: "ನೈರ್ಮಲ್ಯ ನಿರೀಕ್ಷಕ",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
  },
  Water: {
    departmentEn: "Water supply maintenance", departmentHi: "जल आपूर्ति रखरखाव", departmentKn: "ನೀರು ಸರಬರಾಜು ನಿರ್ವಹಣೆ",
    roleEn: "Utility Engineer", roleHi: "उपयोगिता अभियंता", roleKn: "ಯುಟಿಲಿಟಿ ಎಂಜಿನಿಯರ್",
    escalationEn: "BWSSB control room · 1800-14-0014", escalationHi: "बीडब्ल्यूएसएसबी नियंत्रण कक्ष · 1800-14-0014", escalationKn: "ಬಿಡಬ್ಲ್ಯುಎಸ್‌ಎಸ್‌ಬಿ ನಿಯಂತ್ರಣ ಕೋಣೆ · 1800-14-0014",
  },
  Lighting: {
    departmentEn: "Electrical cell", departmentHi: "विद्युत प्रकोष्ठ", departmentKn: "ವಿದ್ಯುತ್ ವಿಭಾಗ",
    roleEn: "Electrical Supervisor", roleHi: "विद्युत पर्यवेक्षक", roleKn: "ವಿದ್ಯುತ್ ಮೇಲ್ವಿಚಾರಕ",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
  },
  Drainage: {
    departmentEn: "Municipal Engineering", departmentHi: "नगर अभियांत्रिकी", departmentKn: "ನಗರ ಎಂಜಿನಿಯರಿಂಗ್",
    roleEn: "Ward Engineer", roleHi: "वार्ड अभियंता", roleKn: "ವಾರ್ಡ್ ಎಂಜಿನಿಯರ್",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
  },
  Traffic: {
    departmentEn: "Traffic engineering", departmentHi: "यातायात अभियांत्रिकी", departmentKn: "ಸಂಚಾರ ಎಂಜಿನಿಯರಿಂಗ್",
    roleEn: "Traffic Engineer", roleHi: "यातायात अभियंता", roleKn: "ಸಂಚಾರ ಎಂಜಿನಿಯರ್",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
  },
  Parks: {
    departmentEn: "Horticulture", departmentHi: "उद्यान विभाग", departmentKn: "ತೋಟಗಾರಿಕೆ",
    roleEn: "Park Supervisor", roleHi: "पार्क पर्यवेक्षक", roleKn: "ಉದ್ಯಾನ ಮೇಲ್ವಿಚಾರಕ",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
  },
  Other: {
    departmentEn: "Ward control room", departmentHi: "वार्ड नियंत्रण कक्ष", departmentKn: "ವಾರ್ಡ್ ನಿಯಂತ್ರಣ ಕೋಣೆ",
    roleEn: "Ward Officer", roleHi: "वार्ड अधिकारी", roleKn: "ವಾರ್ಡ್ ಅಧಿಕಾರಿ",
    escalationEn: "Zonal office · 1800-14-0014", escalationHi: "क्षेत्रीय कार्यालय · 1800-14-0014", escalationKn: "ವಲಯ ಕಚೇರಿ · 1800-14-0014",
  },
};

function timelineFor(status: Issue["status"]): StatusEvent[] {
  if (status === "reported") return roadTimeline.slice(0, 1);
  if (status === "acknowledged") return roadTimeline.slice(0, 2);
  if (status === "in_progress") return roadTimeline;
  if (status === "awaiting_confirmation") {
    return [...roadTimeline, { status: "awaiting_confirmation", labelEn: "Check the fix", labelHi: "मरम्मत जाँचें", labelKn: "ದುರಸ್ತಿ ಪರಿಶೀಲಿಸಿ", date: "26 Aug · 18:10" }];
  }
  if (status === "confirmed") {
    return [...roadTimeline, { status: "awaiting_confirmation", labelEn: "Check the fix", labelHi: "मरम्मत जाँचें", labelKn: "ದುರಸ್ತಿ ಪರಿಶೀಲಿಸಿ", date: "25 Aug · 18:10" }, { status: "confirmed", labelEn: "Confirmed by residents", labelHi: "निवासियों ने पुष्टि की", labelKn: "ನಿವಾಸಿಗಳು ದೃಢಪಡಿಸಿದ್ದಾರೆ", date: "26 Aug · 20:04" }];
  }
  return [...roadTimeline.slice(0, 2), { status: "awaiting_confirmation", labelEn: "Resolved", labelHi: "ठीक बताया गया", labelKn: "ಸರಿಪಡಿಸಲಾಗಿದೆ ಎನ್ನಲಾಗಿದೆ", date: "24 Aug · 16:20" }, { status: "contested", labelEn: "Reopened by a resident", labelHi: "निवासी ने फिर खोला", labelKn: "ನಿವಾಸಿ ಮತ್ತೆ ತೆರೆದಿದ್ದಾರೆ", date: "25 Aug · 08:12", noteEn: "New photo shows the issue is still there", noteHi: "नई फोटो में समस्या अभी भी है", noteKn: "ಹೊಸ ಫೋಟೋದಲ್ಲಿ ಸಮಸ್ಯೆ ಇನ್ನೂ ಇದೆ" }];
}

type DummyIssue = {
  id: string;
  category: Issue["category"];
  titleEn: string;
  titleHi: string;
  titleKn: string;
  descriptionEn: string;
  descriptionHi: string;
  descriptionKn: string;
  address: string;
  lat: number;
  lng: number;
  status: Issue["status"];
  severity: Issue["severity"];
  supporters: number;
  reportedAgoEn: string;
  reportedAgoHi: string;
  reportedAgoKn: string;
  reportedAt: string;
  updatedAt: string;
  expectedEn: string;
  expectedHi: string;
  expectedKn: string;
  overdueDays?: number;
  mergedCount?: number;
  image?: string;
};

/** Open reports inside the demo ward so the default Nearby map is populated. */
const wardSpreadIssues: DummyIssue[] = [
  { id: "FX-14101", category: "Waste", titleEn: "Overflowing bin beside 4th Block Complex", titleHi: "चौथा ब्लॉक कॉम्प्लेक्स के पास भरा डस्टबिन", titleKn: "4ನೇ ಬ್ಲಾಕ್ ಕಾಂಪ್ಲೆಕ್ಸ್ ಬಳಿ ತುಂಬಿದ ಡಸ್ಟ್‌ಬಿನ್", descriptionEn: "The bin has not been cleared and waste is spilling onto the footpath.", descriptionHi: "डस्टबिन नहीं उठाया गया, कचरा फुटपाथ पर फैल गया है।", descriptionKn: "ಡಸ್ಟ್‌ಬಿನ್ ತೆಗೆಯದೆ ತ್ಯಾಜ್ಯ ಕಾಲುದಾರಿಗೆ ಸಿಡಿದಿದೆ.", address: "4th Block Complex", lat: 12.9278, lng: 77.5810, status: "reported", severity: "medium", supporters: 8, reportedAgoEn: "6 hours ago", reportedAgoHi: "6 घंटे पहले", reportedAgoKn: "6 ಗಂಟೆಗಳ ಹಿಂದೆ", reportedAt: "2026-08-27T17:50:00+05:30", updatedAt: "2026-08-27T17:50:00+05:30", expectedEn: "Check today", expectedHi: "आज जाँच", expectedKn: "ಇಂದು ಪರಿಶೀಲನೆ", image: "/images/waste-sabzi-mandi.jpg" },
  { id: "FX-14102", category: "Roads", titleEn: "Pothole on 11th Main near East End", titleHi: "ईस्ट एंड के पास 11वीं मेन पर गड्ढा", titleKn: "ಈಸ್ಟ್ ಎಂಡ್ ಬಳಿ 11ನೇ ಮೇನ್‌ನಲ್ಲಿ ಗುಂಡಿ", descriptionEn: "A deep pit has opened on the left lane after last week's rain.", descriptionHi: "पिछली बारिश के बाद बाईं लेन पर गहरा गड्ढा खुल गया है।", descriptionKn: "ಕಳೆದ ವಾರದ ಮಳೆಯ ನಂತರ ಎಡ ಲೇನ್‌ನಲ್ಲಿ ಆಳವಾದ ಗುಂಡಿ ತೆರೆದಿದೆ.", address: "11th Main, East End", lat: 12.9292, lng: 77.5882, status: "acknowledged", severity: "high", supporters: 15, reportedAgoEn: "3 days ago", reportedAgoHi: "3 दिन पहले", reportedAgoKn: "3 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-24T08:20:00+05:30", updatedAt: "2026-08-25T11:10:00+05:30", expectedEn: "1 Sep", expectedHi: "1 सितम्बर", expectedKn: "1 ಸೆಪ್ಟೆಂಬರ್", image: "/images/issue-roads-pothole-05.jpg" },
  { id: "FX-14103", category: "Drainage", titleEn: "Choked roadside grill in 4th T Block", titleHi: "चौथा टी ब्लॉक में जाम नाली की जाली", titleKn: "4ನೇ ಟಿ ಬ್ಲಾಕ್‌ನಲ್ಲಿ ತುಂಬಿದ ಚರಂಡಿ ಜಾಲಿ", descriptionEn: "Leaves and plastic have blocked the grill and the road edge floods.", descriptionHi: "पत्तियों और प्लास्टिक से जाली जाम है और सड़क किनारे पानी भर जाता है।", descriptionKn: "ಎಲೆ ಮತ್ತು ಪ್ಲಾಸ್ಟಿಕ್‌ನಿಂದ ಜಾಲಿ ತುಂಬಿದ್ದು ರಸ್ತೆ ಅಂಚು ತುಂಬುತ್ತದೆ.", address: "4th T Block", lat: 12.9246, lng: 77.5898, status: "reported", severity: "high", supporters: 11, reportedAgoEn: "1 day ago", reportedAgoHi: "1 दिन पहले", reportedAgoKn: "1 ದಿನದ ಹಿಂದೆ", reportedAt: "2026-08-26T07:05:00+05:30", updatedAt: "2026-08-26T07:05:00+05:30", expectedEn: "Check within 24 hours", expectedHi: "24 घंटे में जाँच", expectedKn: "24 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ", image: "/images/drain-kabir-basti.jpg" },
  { id: "FX-14104", category: "Lighting", titleEn: "Streetlight out on 5th Main", titleHi: "5वीं मेन पर स्ट्रीटलाइट बंद", titleKn: "5ನೇ ಮೇನ್‌ನಲ್ಲಿ ಬೀದಿ ದೀಪ ನಂದಿದೆ", descriptionEn: "The pole by the bus stop has been dark for several nights.", descriptionHi: "बस स्टॉप के पास का पोल कई रातों से अंधेरा है।", descriptionKn: "ಬಸ್ ನಿಲ್ದಾಣ ಬಳಿಯ ಕಂಬ ಹಲವು ರಾತ್ರಿ ಕತ್ತಲೆಯಲ್ಲಿದೆ.", address: "5th Main, 4th Block", lat: 12.9234, lng: 77.5800, status: "acknowledged", severity: "medium", supporters: 9, reportedAgoEn: "5 days ago", reportedAgoHi: "5 दिन पहले", reportedAgoKn: "5 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-22T19:40:00+05:30", updatedAt: "2026-08-23T10:15:00+05:30", expectedEn: "31 Aug", expectedHi: "31 अगस्त", expectedKn: "31 ಆಗಸ್ಟ್", image: "/images/light-community-park.jpg" },
  { id: "FX-14105", category: "Parks", titleEn: "Fallen branch blocking 4th Block park path", titleHi: "चौथा ब्लॉक पार्क का रास्ता शाखा से बंद", titleKn: "4ನೇ ಬ್ಲಾಕ್ ಉದ್ಯಾನ ದಾರಿ ಕೊಂಬೆಯಿಂದ ಮುಚ್ಚಿದೆ", descriptionEn: "A large branch is lying across the walking path.", descriptionHi: "चलने वाले रास्ते पर एक बड़ी शाखा पड़ी है।", descriptionKn: "ನಡೆಯುವ ದಾರಿಯಲ್ಲಿ ದೊಡ್ಡ ಕೊಂಬೆ ಬಿದ್ದಿದೆ.", address: "4th Block park", lat: 12.9288, lng: 77.5772, status: "reported", severity: "medium", supporters: 6, reportedAgoEn: "8 hours ago", reportedAgoHi: "8 घंटे पहले", reportedAgoKn: "8 ಗಂಟೆಗಳ ಹಿಂದೆ", reportedAt: "2026-08-27T16:10:00+05:30", updatedAt: "2026-08-27T16:10:00+05:30", expectedEn: "Check within 48 hours", expectedHi: "48 घंटे में जाँच", expectedKn: "48 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ", image: "/images/issue-parks-tree-01.jpg" },
  { id: "FX-14106", category: "Traffic", titleEn: "Faded zebra crossing at 5th Main junction", titleHi: "5वीं मेन चौराहे पर फीकी ज़ेबरा क्रॉसिंग", titleKn: "5ನೇ ಮೇನ್ ಚೌಕದಲ್ಲಿ ಮಾಸಿದ ಜೀಬ್ರಾ ಕ್ರಾಸಿಂಗ್", descriptionEn: "The crossing markings are worn and hard to see at night.", descriptionHi: "क्रॉसिंग की पेंटिंग घिस गई है, रात में दिखती नहीं।", descriptionKn: "ಕ್ರಾಸಿಂಗ್ ಗುರುತು ಸವೆದಿದೆ, ರಾತ್ರಿ ಕಾಣಿಸುವುದಿಲ್ಲ.", address: "5th Main junction", lat: 12.9218, lng: 77.5776, status: "reported", severity: "medium", supporters: 7, reportedAgoEn: "2 days ago", reportedAgoHi: "2 दिन पहले", reportedAgoKn: "2 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-25T18:05:00+05:30", updatedAt: "2026-08-25T18:05:00+05:30", expectedEn: "Check within 7 days", expectedHi: "7 दिन में जाँच", expectedKn: "7 ದಿನದೊಳಗೆ ಪರಿಶೀಲನೆ", image: "/images/issue-roads-pothole-07.jpg" },
  { id: "FX-14107", category: "Water", titleEn: "Leaking valve on 34th Cross", titleHi: "34वीं क्रॉस पर लीक होता वाल्व", titleKn: "34ನೇ ಕ್ರಾಸ್‌ನಲ್ಲಿ ಸೋರುವ ವಾಲ್ವ್", descriptionEn: "A roadside valve is spraying water onto the carriageway.", descriptionHi: "सड़क किनारे का वाल्व सड़क पर पानी फेंक रहा है।", descriptionKn: "ರಸ್ತೆ ಬದಿಯ ವಾಲ್ವ್ ರಸ್ತೆಗೆ ನೀರು ಚಿಮ್ಮುತ್ತಿದೆ.", address: "34th Cross", lat: 12.9236, lng: 77.5836, status: "reported", severity: "medium", supporters: 5, reportedAgoEn: "4 hours ago", reportedAgoHi: "4 घंटे पहले", reportedAgoKn: "4 ಗಂಟೆಗಳ ಹಿಂದೆ", reportedAt: "2026-08-27T19:40:00+05:30", updatedAt: "2026-08-27T19:40:00+05:30", expectedEn: "Check within 24 hours", expectedHi: "24 घंटे में जाँच", expectedKn: "24 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ", image: "/images/issue-roads-pothole-08.jpg" },
  { id: "FX-14108", category: "Roads", titleEn: "Uneven road patch on 38th Cross", titleHi: "38वीं क्रॉस पर ऊबड़ पैच", titleKn: "38ನೇ ಕ್ರಾಸ್‌ನಲ್ಲಿ ಏರಿಳಿತದ ಪ್ಯಾಚ್", descriptionEn: "The patched surface has sunk and collects water after rain.", descriptionHi: "पैच धँस गया है और बारिश के बाद पानी जमा होता है।", descriptionKn: "ಪ್ಯಾಚ್ ಕುಸಿದು ಮಳೆಯ ನಂತರ ನೀರು ನಿಲ್ಲುತ್ತದೆ.", address: "38th Cross", lat: 12.9276, lng: 77.5848, status: "contested", severity: "medium", supporters: 10, reportedAgoEn: "5 days ago", reportedAgoHi: "5 दिन पहले", reportedAgoKn: "5 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-22T09:30:00+05:30", updatedAt: "2026-08-26T08:20:00+05:30", expectedEn: "Overdue by 1 day", expectedHi: "1 दिन की देरी", expectedKn: "1 ದಿನ ವಿಳಂಬ", overdueDays: 1, image: "/images/issue-roads-pothole-06.jpg" },
  { id: "FX-14109", category: "Waste", titleEn: "Construction debris on 33rd Cross", titleHi: "33वीं क्रॉस पर निर्माण मलबा", titleKn: "33ನೇ ಕ್ರಾಸ್‌ನಲ್ಲಿ ನಿರ್ಮಾಣ ಕಸ", descriptionEn: "Rubble is occupying part of the carriageway and the footpath.", descriptionHi: "मलबे ने सड़क और फुटपाथ का हिस्सा घेर लिया है।", descriptionKn: "ಕಸವು ರಸ್ತೆ ಮತ್ತು ಕಾಲುದಾರಿಯ ಭಾಗವನ್ನು ಆಕ್ರಮಿಸಿದೆ.", address: "33rd Cross", lat: 12.9194, lng: 77.5840, status: "acknowledged", severity: "medium", supporters: 12, reportedAgoEn: "1 day ago", reportedAgoHi: "1 दिन पहले", reportedAgoKn: "1 ದಿನದ ಹಿಂದೆ", reportedAt: "2026-08-26T11:40:00+05:30", updatedAt: "2026-08-27T09:15:00+05:30", expectedEn: "30 Aug", expectedHi: "30 अगस्त", expectedKn: "30 ಆಗಸ್ಟ್", image: "/images/waste-metro-gate.jpg" },
];

const dummyIssues: DummyIssue[] = [
  { id: "FX-15001", category: "Roads", titleEn: "Pothole on 80 Feet Road near Forum", titleHi: "फोरम के पास 80 फीट रोड पर गड्ढा", titleKn: "ಫೋರಂ ಬಳಿ 80 ಅಡಿ ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ", descriptionEn: "A wide pothole on the outer lane slows traffic after rain.", descriptionHi: "बाहरी लेन के गड्ढे से बारिश के बाद ट्रैफिक रुकता है।", descriptionKn: "ಹೊರಗಿನ ಲೇನ್‌ನ ಗುಂಡಿಯಿಂದ ಮಳೆಯ ನಂತರ ಸಂಚಾರ ನಿಧಾನ.", address: "80 Feet Road, Koramangala", lat: 12.9354, lng: 77.6112, status: "reported", severity: "high", supporters: 14, reportedAgoEn: "5 hours ago", reportedAgoHi: "5 घंटे पहले", reportedAgoKn: "5 ಗಂಟೆಗಳ ಹಿಂದೆ", reportedAt: "2026-08-27T11:10:00+05:30", updatedAt: "2026-08-27T11:10:00+05:30", expectedEn: "Check within 48 hours", expectedHi: "48 घंटे में जाँच", expectedKn: "48 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ", mergedCount: 2 },
  { id: "FX-15002", category: "Waste", titleEn: "Garbage piled beside Koramangala 5th Block park", titleHi: "कोरमंगला 5वें ब्लॉक पार्क के पास कचरा", titleKn: "ಕೋರಮಂಗಲ 5ನೇ ಬ್ಲಾಕ್ ಉದ್ಯಾನ ಬಳಿ ತ್ಯಾಜ್ಯ", descriptionEn: "Household waste is blocking part of the footpath.", descriptionHi: "घरेलू कचरे ने फुटपाथ का हिस्सा रोक दिया है।", descriptionKn: "ಮನೆ ತ್ಯಾಜ್ಯವು ಕಾಲುದಾರಿಯ ಭಾಗವನ್ನು ತಡೆದಿದೆ.", address: "5th Block, Koramangala", lat: 12.9346, lng: 77.6228, status: "acknowledged", severity: "medium", supporters: 9, reportedAgoEn: "2 days ago", reportedAgoHi: "2 दिन पहले", reportedAgoKn: "2 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-25T08:20:00+05:30", updatedAt: "2026-08-26T10:00:00+05:30", expectedEn: "29 Aug", expectedHi: "29 अगस्त", expectedKn: "29 ಆಗಸ್ಟ್" },
  { id: "FX-15003", category: "Lighting", titleEn: "Dark stretch on 7th Cross after sunset", titleHi: "सूर्यास्त के बाद 7वीं क्रॉस अंधेरी", titleKn: "ಸೂರ್ಯಾಸ್ತದ ನಂತರ 7ನೇ ಕ್ರಾಸ್ ಕತ್ತಲೆ", descriptionEn: "Two streetlights are out on the school route.", descriptionHi: "स्कूल वाले रास्ते पर दो स्ट्रीटलाइट बंद हैं।", descriptionKn: "ಶಾಲೆ ದಾರಿಯಲ್ಲಿ ಎರಡು ಬೀದಿ ದೀಪ ನಂದಿವೆ.", address: "7th Cross, Koramangala", lat: 12.9368, lng: 77.6254, status: "in_progress", severity: "medium", supporters: 11, reportedAgoEn: "8 days ago", reportedAgoHi: "8 दिन पहले", reportedAgoKn: "8 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-19T19:40:00+05:30", updatedAt: "2026-08-26T16:20:00+05:30", expectedEn: "30 Aug", expectedHi: "30 अगस्त", expectedKn: "30 ಆಗಸ್ಟ್" },
  { id: "FX-15004", category: "Drainage", titleEn: "Clogged drain on Sarjapur Road service lane", titleHi: "सर्जापुर रोड सर्विस लेन पर भरी नाली", titleKn: "ಸರ್ಜಾಪುರ ರಸ್ತೆ ಸರ್ವೀಸ್ ಲೇನ್‌ನಲ್ಲಿ ತುಂಬಿದ ಚರಂಡಿ", descriptionEn: "Stagnant water sits beside the bus stop after every rain.", descriptionHi: "हर बारिश के बाद बस स्टॉप के पास पानी ठहर जाता है।", descriptionKn: "ಪ್ರತಿ ಮಳೆಯ ನಂತರ ಬಸ್ ನಿಲ್ದಾಣ ಬಳಿ ನೀರು ನಿಲ್ಲುತ್ತದೆ.", address: "Sarjapur Road, Koramangala", lat: 12.9286, lng: 77.6204, status: "reported", severity: "high", supporters: 17, reportedAgoEn: "1 day ago", reportedAgoHi: "1 दिन पहले", reportedAgoKn: "1 ದಿನದ ಹಿಂದೆ", reportedAt: "2026-08-26T07:15:00+05:30", updatedAt: "2026-08-26T07:15:00+05:30", expectedEn: "Check within 24 hours", expectedHi: "24 घंटे में जाँच", expectedKn: "24 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ" },
  { id: "FX-15005", category: "Water", titleEn: "Leaking main near St. John's gate", titleHi: "सेंट जॉन्स गेट के पास पाइप लीक", titleKn: "ಸೇಂಟ್ ಜಾನ್ಸ್ ಗೇಟ್ ಬಳಿ ಪೈಪ್ ಸೋರಿಕೆ", descriptionEn: "Clean water has been running into the gutter since morning.", descriptionHi: "सुबह से साफ पानी नाली में बह रहा है।", descriptionKn: "ಬೆಳಿಗ್ಗಿನಿಂದ ಶುದ್ಧ ನೀರು ಚರಂಡಿಗೆ ಸೋರುತ್ತಿದೆ.", address: "St. John's Medical College", lat: 12.9298, lng: 77.6186, status: "acknowledged", severity: "medium", supporters: 6, reportedAgoEn: "6 hours ago", reportedAgoHi: "6 घंटे पहले", reportedAgoKn: "6 ಗಂಟೆಗಳ ಹಿಂದೆ", reportedAt: "2026-08-27T10:05:00+05:30", updatedAt: "2026-08-27T12:40:00+05:30", expectedEn: "Check within 24 hours", expectedHi: "24 घंटे में जाँच", expectedKn: "24 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ" },
  { id: "FX-15006", category: "Roads", titleEn: "Broken speed breaker on 1st A Cross", titleHi: "1st A क्रॉस पर टूटा स्पीड ब्रेकर", titleKn: "1ನೇ ಎ ಕ್ರಾಸ್‌ನಲ್ಲಿ ಒಡೆದ ಸ್ಪೀಡ್ ಬ್ರೇಕರ್", descriptionEn: "The edge is sharp and risky for two-wheelers.", descriptionHi: "किनारा तेज है और दोपहिया वाहनों के लिए खतरनाक है।", descriptionKn: "ಅಂಚು ತೀಕ್ಷ್ಣವಾಗಿದ್ದು ದ್ವಿಚಕ್ರ ವಾಹನಗಳಿಗೆ ಅಪಾಯ.", address: "1st A Cross, Koramangala", lat: 12.9332, lng: 77.6271, status: "contested", severity: "medium", supporters: 8, reportedAgoEn: "4 days ago", reportedAgoHi: "4 दिन पहले", reportedAgoKn: "4 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-23T09:30:00+05:30", updatedAt: "2026-08-26T08:10:00+05:30", expectedEn: "Overdue by 1 day", expectedHi: "1 दिन की देरी", expectedKn: "1 ದಿನ ವಿಳಂಬ", overdueDays: 1 },
  { id: "FX-15007", category: "Waste", titleEn: "Uncollected waste at Madiwala market corner", titleHi: "मदिवाला बाज़ार कोने पर कचरा", titleKn: "ಮದಿವಾಲ ಮಾರುಕಟ್ಟೆ ಮೂಲೆಯಲ್ಲಿ ತ್ಯಾಜ್ಯ", descriptionEn: "Wet waste has been left beside the collection point.", descriptionHi: "संग्रह बिंदु के पास गीला कचरा पड़ा है।", descriptionKn: "ಸಂಗ್ರಹ ಸ್ಥಳದ ಬಳಿ ಒದ್ದೆ ತ್ಯಾಜ್ಯ ಇದೆ.", address: "Madiwala Market", lat: 12.9214, lng: 77.6176, status: "reported", severity: "medium", supporters: 12, reportedAgoEn: "3 hours ago", reportedAgoHi: "3 घंटे पहले", reportedAgoKn: "3 ಗಂಟೆಗಳ ಹಿಂದೆ", reportedAt: "2026-08-27T13:20:00+05:30", updatedAt: "2026-08-27T13:20:00+05:30", expectedEn: "Check today", expectedHi: "आज जाँच", expectedKn: "ಇಂದು ಪರಿಶೀಲನೆ" },
  { id: "FX-15008", category: "Drainage", titleEn: "Open drain overflowing toward BTM flyover", titleHi: "बीटीएम फ्लाईओवर की ओर उफनती नाली", titleKn: "ಬಿಟಿಎಂ ಫ್ಲೈಓವರ್ ಕಡೆಗೆ ಚರಂಡಿ ತುಂಬಿ ಹರಿಯುತ್ತಿದೆ", descriptionEn: "The open drain is choked with silt on the downhill stretch.", descriptionHi: "ढलान वाले हिस्से पर खुली नाली गाद से जाम है।", descriptionKn: "ಇಳಿಜಾರು ಭಾಗದಲ್ಲಿ ತೆರೆದ ಚರಂಡಿ ಹೂಳಿನಿಂದ ತುಂಬಿದೆ.", address: "Madiwala checkpost", lat: 12.9202, lng: 77.6148, status: "in_progress", severity: "high", supporters: 21, reportedAgoEn: "9 days ago", reportedAgoHi: "9 दिन पहले", reportedAgoKn: "9 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-18T06:50:00+05:30", updatedAt: "2026-08-25T11:30:00+05:30", expectedEn: "1 Sep", expectedHi: "1 सितम्बर", expectedKn: "1 ಸೆಪ್ಟೆಂಬರ್", mergedCount: 3 },
  { id: "FX-15009", category: "Roads", titleEn: "Cracked road surface on 16th Main, BTM", titleHi: "बीटीएम 16वीं मेन पर टूटी सड़क", titleKn: "ಬಿಟಿಎಂ 16ನೇ ಮೇನ್‌ನಲ್ಲಿ ಒಡೆದ ರಸ್ತೆ", descriptionEn: "The asphalt has split across both lanes near the water tank.", descriptionHi: "वाटर टैंक के पास दोनों लेन की सड़क फट गई है।", descriptionKn: "ನೀರಿನ ಟ್ಯಾಂಕ್ ಬಳಿ ಎರಡೂ ಲೇನ್‌ನ ರಸ್ತೆ ಬಿರುಕು ಬಿಟ್ಟಿದೆ.", address: "16th Main, BTM 1st Stage", lat: 12.9166, lng: 77.6104, status: "acknowledged", severity: "high", supporters: 15, reportedAgoEn: "3 days ago", reportedAgoHi: "3 दिन पहले", reportedAgoKn: "3 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-24T08:05:00+05:30", updatedAt: "2026-08-25T09:40:00+05:30", expectedEn: "2 Sep", expectedHi: "2 सितम्बर", expectedKn: "2 ಸೆಪ್ಟೆಂಬರ್" },
  { id: "FX-15010", category: "Lighting", titleEn: "Park road dark near BTM water tank", titleHi: "बीटीएम वाटर टैंक के पास पार्क सड़क अंधेरी", titleKn: "ಬಿಟಿಎಂ ನೀರಿನ ಟ್ಯಾಂಕ್ ಬಳಿ ಉದ್ಯಾನ ರಸ್ತೆ ಕತ್ತಲೆ", descriptionEn: "The stretch has little usable light after 7 PM.", descriptionHi: "रात 7 बजे के बाद यह सड़क लगभग अंधेरी रहती है।", descriptionKn: "ಸಂಜೆ 7ರ ನಂತರ ಈ ರಸ್ತೆ ಬಹುತೇಕ ಕತ್ತಲೆಯಲ್ಲಿರುತ್ತದೆ.", address: "BTM 2nd Stage", lat: 12.9134, lng: 77.6109, status: "reported", severity: "medium", supporters: 7, reportedAgoEn: "12 hours ago", reportedAgoHi: "12 घंटे पहले", reportedAgoKn: "12 ಗಂಟೆಗಳ ಹಿಂದೆ", reportedAt: "2026-08-27T04:20:00+05:30", updatedAt: "2026-08-27T04:20:00+05:30", expectedEn: "Check within 48 hours", expectedHi: "48 घंटे में जाँच", expectedKn: "48 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ" },
  { id: "FX-15011", category: "Waste", titleEn: "Dumping beside silk board underpass", titleHi: "सिल्क बोर्ड अंडरपास के पास कचरा", titleKn: "ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಅಂಡರ್‌ಪಾಸ್ ಬಳಿ ತ್ಯಾಜ್ಯ", descriptionEn: "Mixed waste is left against the retaining wall.", descriptionHi: "रिटेनिंग वॉल के साथ मिश्रित कचरा डाला गया है।", descriptionKn: "ರಿಟೇನಿಂಗ್ ಗೋಡೆಯ ಬಳಿ ಮಿಶ್ರ ತ್ಯಾಜ್ಯ ಹಾಕಲಾಗಿದೆ.", address: "Silk Board junction", lat: 12.9178, lng: 77.6226, status: "acknowledged", severity: "medium", supporters: 10, reportedAgoEn: "1 day ago", reportedAgoHi: "1 दिन पहले", reportedAgoKn: "1 ದಿನದ ಹಿಂದೆ", reportedAt: "2026-08-26T18:40:00+05:30", updatedAt: "2026-08-27T09:00:00+05:30", expectedEn: "31 Aug", expectedHi: "31 अगस्त", expectedKn: "31 ಆಗಸ್ಟ್" },
  { id: "FX-15012", category: "Water", titleEn: "Broken valve leaking on 29th Main", titleHi: "29वीं मेन पर टूटा वाल्व लीक", titleKn: "29ನೇ ಮೇನ್‌ನಲ್ಲಿ ಒಡೆದ ವಾಲ್ವ್ ಸೋರಿಕೆ", descriptionEn: "A roadside valve has been spraying water onto the carriageway.", descriptionHi: "सड़क किनारे का वाल्व सड़क पर पानी फेंक रहा है।", descriptionKn: "ರಸ್ತೆ ಬದಿಯ ವಾಲ್ವ್ ರಸ್ತೆಗೆ ನೀರು ಚಿಮ್ಮುತ್ತಿದೆ.", address: "29th Main, BTM", lat: 12.9152, lng: 77.6072, status: "reported", severity: "high", supporters: 5, reportedAgoEn: "2 hours ago", reportedAgoHi: "2 घंटे पहले", reportedAgoKn: "2 ಗಂಟೆಗಳ ಹಿಂದೆ", reportedAt: "2026-08-27T14:05:00+05:30", updatedAt: "2026-08-27T14:05:00+05:30", expectedEn: "Check within 24 hours", expectedHi: "24 घंटे में जाँच", expectedKn: "24 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ" },
  { id: "FX-15013", category: "Roads", titleEn: "Uneven patch near Jyoti Nivas college", titleHi: "ज्योति निवास कॉलेज के पास ऊबड़ सड़क", titleKn: "ಜ್ಯೋತಿ ನಿವಾಸ್ ಕಾಲೇಜು ಬಳಿ ಏರಿಳಿತದ ರಸ್ತೆ", descriptionEn: "The patched surface has sunk and collects water.", descriptionHi: "पैच धँस गया है और पानी जमा होता है।", descriptionKn: "ಪ್ಯಾಚ್ ಕುಸಿದು ನೀರು ನಿಲ್ಲುತ್ತದೆ.", address: "Koramangala 8th Block", lat: 12.9408, lng: 77.6142, status: "in_progress", severity: "medium", supporters: 4, reportedAgoEn: "11 days ago", reportedAgoHi: "11 दिन पहले", reportedAgoKn: "11 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-16T10:10:00+05:30", updatedAt: "2026-08-24T15:00:00+05:30", expectedEn: "3 Sep", expectedHi: "3 सितम्बर", expectedKn: "3 ಸೆಪ್ಟೆಂಬರ್" },
  { id: "FX-15014", category: "Parks", titleEn: "Broken play equipment at Koramangala park", titleHi: "कोरमंगला पार्क में टूटा खेल उपकरण", titleKn: "ಕೋರಮಂಗಲ ಉದ್ಯಾನದಲ್ಲಿ ಒಡೆದ ಆಟದ ಸಾಧನ", descriptionEn: "A swing frame is loose and should not be used.", descriptionHi: "झूले का फ्रेम ढीला है, इस्तेमाल न करें।", descriptionKn: "ಊಯ್ಯಾಲೆ ಚೌಕಟ್ಟು ಸಡಿಲವಾಗಿದೆ, ಬಳಸಬಾರದು.", address: "Koramangala indoor stadium park", lat: 12.9376, lng: 77.6198, status: "acknowledged", severity: "medium", supporters: 13, reportedAgoEn: "6 days ago", reportedAgoHi: "6 दिन पहले", reportedAgoKn: "6 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-21T16:30:00+05:30", updatedAt: "2026-08-22T11:00:00+05:30", expectedEn: "4 Sep", expectedHi: "4 सितम्बर", expectedKn: "4 ಸೆಪ್ಟೆಂಬರ್" },
  { id: "FX-15015", category: "Traffic", titleEn: "Faded zebra crossing at Sony Signal", titleHi: "सोनी सिग्नल पर फीकी ज़ेबरा क्रॉसिंग", titleKn: "ಸೋನಿ ಸಿಗ್ನಲ್‌ನಲ್ಲಿ ಮಾಸಿದ ಜೀಬ್ರಾ ಕ್ರಾಸಿಂಗ್", descriptionEn: "The crossing markings are worn and hard to see at night.", descriptionHi: "क्रॉसिंग की पेंटिंग घिस गई है, रात में दिखती नहीं।", descriptionKn: "ಕ್ರಾಸಿಂಗ್ ಗುರುತು ಸವೆದಿದೆ, ರಾತ್ರಿ ಕಾಣಿಸುವುದಿಲ್ಲ.", address: "Sony Signal, Koramangala", lat: 12.9342, lng: 77.6266, status: "reported", severity: "medium", supporters: 8, reportedAgoEn: "2 days ago", reportedAgoHi: "2 दिन पहले", reportedAgoKn: "2 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-25T17:45:00+05:30", updatedAt: "2026-08-25T17:45:00+05:30", expectedEn: "Check within 7 days", expectedHi: "7 दिन में जाँच", expectedKn: "7 ದಿನದೊಳಗೆ ಪರಿಶೀಲನೆ" },
  { id: "FX-15016", category: "Drainage", titleEn: "Manhole overflow on 100 Feet Road", titleHi: "100 फीट रोड पर मैनहोल ओवरफ्लो", titleKn: "100 ಅಡಿ ರಸ್ತೆಯಲ್ಲಿ ಮ್ಯಾನ್‌ಹೋಲ್ ತುಂಬಿ ಹರಿಯುತ್ತಿದೆ", descriptionEn: "Sewage is coming up through the cover after rain.", descriptionHi: "बारिश के बाद कवर से सीवेज ऊपर आ रहा है।", descriptionKn: "ಮಳೆಯ ನಂತರ ಕವರ್‌ನಿಂದ ಒಳಚರಂಡಿ ಮೇಲೆ ಬರುತ್ತಿದೆ.", address: "100 Feet Road, Koramangala", lat: 12.9359, lng: 77.6294, status: "contested", severity: "high", supporters: 19, reportedAgoEn: "7 days ago", reportedAgoHi: "7 दिन पहले", reportedAgoKn: "7 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-20T07:25:00+05:30", updatedAt: "2026-08-26T07:50:00+05:30", expectedEn: "Overdue by 2 days", expectedHi: "2 दिन की देरी", expectedKn: "2 ದಿನ ವಿಳಂಬ", overdueDays: 2 },
  { id: "FX-15017", category: "Roads", titleEn: "Pothole cluster near Adugodi signal", titleHi: "अडुगोडी सिग्नल के पास गड्ढे", titleKn: "ಅಡುಗೋಡಿ ಸಿಗ್ನಲ್ ಬಳಿ ಗುಂಡಿಗಳು", descriptionEn: "Several deep pits have opened on the right turn.", descriptionHi: "दाएँ मोड़ पर कई गहरे गड्ढे खुल गए हैं।", descriptionKn: "ಬಲ ತಿರುವಿನಲ್ಲಿ ಹಲವು ಆಳವಾದ ಗುಂಡಿಗಳಿವೆ.", address: "Adugodi", lat: 12.9426, lng: 77.6088, status: "reported", severity: "high", supporters: 16, reportedAgoEn: "8 hours ago", reportedAgoHi: "8 घंटे पहले", reportedAgoKn: "8 ಗಂಟೆಗಳ ಹಿಂದೆ", reportedAt: "2026-08-27T08:15:00+05:30", updatedAt: "2026-08-27T08:15:00+05:30", expectedEn: "Check within 48 hours", expectedHi: "48 घंटे में जाँच", expectedKn: "48 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ" },
  { id: "FX-15018", category: "Waste", titleEn: "Overflowing bin on Hosur Road footpath", titleHi: "होसुर रोड फुटपाथ पर भरा डस्टबिन", titleKn: "ಹೊಸೂರು ರಸ್ತೆ ಕಾಲುದಾರಿಯಲ್ಲಿ ತುಂಬಿದ ಡಸ್ಟ್‌ಬಿನ್", descriptionEn: "The bin has not been cleared and waste is on the path.", descriptionHi: "डस्टबिन नहीं उठाया गया, कचरा रास्ते पर है।", descriptionKn: "ಡಸ್ಟ್‌ಬಿನ್ ತೆಗೆಯದೆ ತ್ಯಾಜ್ಯ ದಾರಿಯಲ್ಲಿದೆ.", address: "Hosur Road, Koramangala", lat: 12.9318, lng: 77.6156, status: "acknowledged", severity: "low", supporters: 3, reportedAgoEn: "1 day ago", reportedAgoHi: "1 दिन पहले", reportedAgoKn: "1 ದಿನದ ಹಿಂದೆ", reportedAt: "2026-08-26T11:55:00+05:30", updatedAt: "2026-08-26T15:10:00+05:30", expectedEn: "28 Aug", expectedHi: "28 अगस्त", expectedKn: "28 ಆಗಸ್ಟ್" },
  { id: "FX-15019", category: "Lighting", titleEn: "Streetlight out near Ejipura bus stop", titleHi: "एजीपुरा बस स्टॉप के पास स्ट्रीटलाइट बंद", titleKn: "ಎಜಿಪುರ ಬಸ್ ನಿಲ್ದಾಣ ಬಳಿ ಬೀದಿ ದೀಪ ನಂದಿದೆ", descriptionEn: "The pole beside the shelter has been dark for several nights.", descriptionHi: "शेल्टर के पास का पोल कई रातों से अंधेरा है।", descriptionKn: "ಶೆಲ್ಟರ್ ಬಳಿಯ ಕಂಬ ಹಲವು ರಾತ್ರಿ ಕತ್ತಲೆಯಲ್ಲಿದೆ.", address: "Ejipura", lat: 12.9434, lng: 77.6282, status: "reported", severity: "medium", supporters: 6, reportedAgoEn: "3 days ago", reportedAgoHi: "3 दिन पहले", reportedAgoKn: "3 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-24T20:10:00+05:30", updatedAt: "2026-08-24T20:10:00+05:30", expectedEn: "Check within 48 hours", expectedHi: "48 घंटे में जाँच", expectedKn: "48 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ" },
  { id: "FX-15020", category: "Roads", titleEn: "Sunken manhole on 27th Main, HSR", titleHi: "एचएसआर 27वीं मेन पर धँसा मैनहोल", titleKn: "ಎಚ್‌ಎಸ್‌ಆರ್ 27ನೇ ಮೇನ್‌ನಲ್ಲಿ ಕುಸಿದ ಮ್ಯಾನ್‌ಹೋಲ್", descriptionEn: "The cover sits below the road and catches two-wheeler wheels.", descriptionHi: "कवर सड़क से नीचे है और दोपहिया पहिए फँसते हैं।", descriptionKn: "ಕವರ್ ರಸ್ತೆಗಿಂತ ಕೆಳಗಿದ್ದು ದ್ವಿಚಕ್ರ ಚಕ್ರ ಸಿಲುಕುತ್ತದೆ.", address: "27th Main, HSR Layout", lat: 12.9126, lng: 77.6384, status: "acknowledged", severity: "high", supporters: 18, reportedAgoEn: "4 days ago", reportedAgoHi: "4 दिन पहले", reportedAgoKn: "4 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-23T07:40:00+05:30", updatedAt: "2026-08-24T09:20:00+05:30", expectedEn: "31 Aug", expectedHi: "31 अगस्त", expectedKn: "31 ಆಗಸ್ಟ್" },
  { id: "FX-15021", category: "Waste", titleEn: "Construction debris on 12th Main, Indiranagar", titleHi: "इंदिरानगर 12वीं मेन पर निर्माण मलबा", titleKn: "ಇಂದಿರಾನಗರ 12ನೇ ಮೇನ್‌ನಲ್ಲಿ ನಿರ್ಮಾಣ ಕಸ", descriptionEn: "Rubble is occupying a parking bay and part of the footpath.", descriptionHi: "मलबे ने पार्किंग और फुटपाथ का हिस्सा घेर लिया है।", descriptionKn: "ಕಸವು ಪಾರ್ಕಿಂಗ್ ಮತ್ತು ಕಾಲುದಾರಿಯ ಭಾಗವನ್ನು ಆಕ್ರಮಿಸಿದೆ.", address: "12th Main, Indiranagar", lat: 12.9782, lng: 77.6408, status: "reported", severity: "medium", supporters: 7, reportedAgoEn: "2 days ago", reportedAgoHi: "2 दिन पहले", reportedAgoKn: "2 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-25T13:00:00+05:30", updatedAt: "2026-08-25T13:00:00+05:30", expectedEn: "Check within 48 hours", expectedHi: "48 घंटे में जाँच", expectedKn: "48 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ" },
  { id: "FX-15022", category: "Water", titleEn: "Low pressure leak on 100 Feet Road, Indiranagar", titleHi: "इंदिरानगर 100 फीट रोड पर पाइप लीक", titleKn: "ಇಂದಿರಾನಗರ 100 ಅಡಿ ರಸ್ತೆಯಲ್ಲಿ ಪೈಪ್ ಸೋರಿಕೆ", descriptionEn: "A hairline leak has turned the footpath slippery.", descriptionHi: "पतले लीक से फुटपाथ फिसलन भरा हो गया है।", descriptionKn: "ಸಣ್ಣ ಸೋರಿಕೆಯಿಂದ ಕಾಲುದಾರಿ ಜಾರುವಂತಾಗಿದೆ.", address: "100 Feet Road, Indiranagar", lat: 12.9718, lng: 77.6412, status: "in_progress", severity: "low", supporters: 4, reportedAgoEn: "5 days ago", reportedAgoHi: "5 दिन पहले", reportedAgoKn: "5 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-22T09:20:00+05:30", updatedAt: "2026-08-26T14:10:00+05:30", expectedEn: "29 Aug", expectedHi: "29 अगस्त", expectedKn: "29 ಆಗಸ್ಟ್" },
  { id: "FX-15023", category: "Drainage", titleEn: "Choked roadside drain in JP Nagar 5th Phase", titleHi: "जेपी नगर 5वें फेज में भरी नाली", titleKn: "ಜೆಪಿ ನಗರ 5ನೇ ಹಂತದಲ್ಲಿ ತುಂಬಿದ ಚರಂಡಿ", descriptionEn: "Leaves and plastic have blocked the grill after last week's rain.", descriptionHi: "पिछली बारिश के बाद पत्तियों और प्लास्टिक से जाली जाम है।", descriptionKn: "ಕಳೆದ ವಾರದ ಮಳೆಯ ನಂತರ ಎಲೆ ಮತ್ತು ಪ್ಲಾಸ್ಟಿಕ್‌ನಿಂದ ಜಾಲಿ ತುಂಬಿದೆ.", address: "JP Nagar 5th Phase", lat: 12.9078, lng: 77.5926, status: "reported", severity: "medium", supporters: 5, reportedAgoEn: "1 day ago", reportedAgoHi: "1 दिन पहले", reportedAgoKn: "1 ದಿನದ ಹಿಂದೆ", reportedAt: "2026-08-26T16:00:00+05:30", updatedAt: "2026-08-26T16:00:00+05:30", expectedEn: "Check within 48 hours", expectedHi: "48 घंटे में जाँच", expectedKn: "48 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ" },
  { id: "FX-15024", category: "Roads", titleEn: "Broken kerb at Banashankari bus stand", titleHi: "बनशंकरी बस स्टैंड पर टूटा कर्ब", titleKn: "ಬನಶಂಕರಿ ಬಸ್ ನಿಲ್ದಾಣದಲ್ಲಿ ಒಡೆದ ಕರ್ಬ್", descriptionEn: "The kerbstone has collapsed and the edge is exposed.", descriptionHi: "कर्बस्टोन गिर गया है और किनारा खुला है।", descriptionKn: "ಕರ್ಬ್‌ಸ್ಟೋನ್ ಕುಸಿದು ಅಂಚು ತೆರೆದಿದೆ.", address: "Banashankari bus stand", lat: 12.9256, lng: 77.5508, status: "acknowledged", severity: "medium", supporters: 9, reportedAgoEn: "6 days ago", reportedAgoHi: "6 दिन पहले", reportedAgoKn: "6 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-21T08:50:00+05:30", updatedAt: "2026-08-22T10:30:00+05:30", expectedEn: "5 Sep", expectedHi: "5 सितम्बर", expectedKn: "5 ಸೆಪ್ಟೆಂಬರ್" },
  { id: "FX-15025", category: "Lighting", titleEn: "Dark walkway beside Lalbagh west gate", titleHi: "लालबाग पश्चिमी गेट के पास अंधेरी सड़क", titleKn: "ಲಾಲ್‌ಬಾಗ್ ಪಶ್ಚಿಮ ಗೇಟ್ ಬಳಿ ಕತ್ತಲೆ ದಾರಿ", descriptionEn: "The path used by evening walkers has no working light.", descriptionHi: "शाम को चलने वाले रास्ते पर कोई रोशनी नहीं है।", descriptionKn: "ಸಂಜೆ ನಡೆಯುವ ದಾರಿಯಲ್ಲಿ ಬೆಳಕು ಇಲ್ಲ.", address: "Lalbagh west gate", lat: 12.9507, lng: 77.5848, status: "reported", severity: "low", supporters: 11, reportedAgoEn: "4 days ago", reportedAgoHi: "4 दिन पहले", reportedAgoKn: "4 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-23T19:15:00+05:30", updatedAt: "2026-08-23T19:15:00+05:30", expectedEn: "Check within 7 days", expectedHi: "7 दिन में जाँच", expectedKn: "7 ದಿನದೊಳಗೆ ಪರಿಶೀಲನೆ" },
  { id: "FX-15026", category: "Waste", titleEn: "Dumping behind Wilson Garden market", titleHi: "विल्सन गार्डन बाज़ार के पीछे कचरा", titleKn: "ವಿಲ್ಸನ್ ಗಾರ್ಡನ್ ಮಾರುಕಟ್ಟೆ ಹಿಂದೆ ತ್ಯಾಜ್ಯ", descriptionEn: "Vegetable waste is left overnight beside the lane.", descriptionHi: "गली के पास रात भर सब्जी का कचरा पड़ा रहता है।", descriptionKn: "ಗಲ್ಲಿ ಬಳಿ ರಾತ್ರಿ ತರಕಾರಿ ತ್ಯಾಜ್ಯ ಇರುತ್ತದೆ.", address: "Wilson Garden", lat: 12.9484, lng: 77.5972, status: "in_progress", severity: "medium", supporters: 8, reportedAgoEn: "10 days ago", reportedAgoHi: "10 दिन पहले", reportedAgoKn: "10 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-17T06:40:00+05:30", updatedAt: "2026-08-25T08:20:00+05:30", expectedEn: "30 Aug", expectedHi: "30 अगस्त", expectedKn: "30 ಆಗಸ್ಟ್" },
  { id: "FX-15027", category: "Roads", titleEn: "Pothole on Richmond Road service lane", titleHi: "रिचमंड रोड सर्विस लेन पर गड्ढा", titleKn: "ರಿಚ್‌ಮಂಡ್ ರಸ್ತೆ ಸರ್ವೀಸ್ ಲೇನ್‌ನಲ್ಲಿ ಗುಂಡಿ", descriptionEn: "A deep cavity has opened near the office stretch.", descriptionHi: "ऑफिस वाले हिस्से के पास गहरा गड्ढा खुल गया है।", descriptionKn: "ಕಚೇರಿ ಭಾಗದ ಬಳಿ ಆಳವಾದ ಗುಂಡಿ ತೆರೆದಿದೆ.", address: "Richmond Road", lat: 12.9664, lng: 77.6102, status: "acknowledged", severity: "high", supporters: 12, reportedAgoEn: "2 days ago", reportedAgoHi: "2 दिन पहले", reportedAgoKn: "2 ದಿನಗಳ ಹಿಂದೆ", reportedAt: "2026-08-25T08:55:00+05:30", updatedAt: "2026-08-26T11:15:00+05:30", expectedEn: "1 Sep", expectedHi: "1 सितम्बर", expectedKn: "1 ಸೆಪ್ಟೆಂಬರ್" },
  { id: "FX-15028", category: "Drainage", titleEn: "Blocked storm drain in Domlur 2nd Stage", titleHi: "डोमलुर दूसरे स्टेज में जाम स्टॉर्म ड्रेन", titleKn: "ಡೊಮ್ಲೂರು 2ನೇ ಹಂತದಲ್ಲಿ ತಡೆದ ಚರಂಡಿ", descriptionEn: "The grill is packed with silt and the road edge floods.", descriptionHi: "जाली गाद से भरी है और सड़क किनारे पानी भर जाता है।", descriptionKn: "ಜಾಲಿ ಹೂಳಿನಿಂದ ತುಂಬಿದ್ದು ರಸ್ತೆ ಅಂಚು ತುಂಬುತ್ತದೆ.", address: "Domlur 2nd Stage", lat: 12.9608, lng: 77.6386, status: "reported", severity: "medium", supporters: 6, reportedAgoEn: "5 hours ago", reportedAgoHi: "5 घंटे पहले", reportedAgoKn: "5 ಗಂಟೆಗಳ ಹಿಂದೆ", reportedAt: "2026-08-27T11:25:00+05:30", updatedAt: "2026-08-27T11:25:00+05:30", expectedEn: "Check within 48 hours", expectedHi: "48 घंटे में जाँच", expectedKn: "48 ಗಂಟೆಯೊಳಗೆ ಪರಿಶೀಲನೆ" },
];

function fromDummy(issue: DummyIssue): Issue {
  const { image, ...rest } = issue;
  return {
    ...rest,
    image: image ?? imageFor(issue.category, issue.id),
    aliases: ["A neighbour"],
    ...teams[issue.category],
    trust: [],
    timeline: timelineFor(issue.status),
  };
}

export const seedIssues: Issue[] = [...rawSeedIssues, ...wardSpreadIssues.map(fromDummy), ...dummyIssues.map(fromDummy)].map((issue) => ({
  ...issue,
  image: assetPath(issue.image),
  resolutionImage: issue.resolutionImage ? assetPath(issue.resolutionImage) : undefined,
  trust: issue.trust.length ? issue.trust : trustFor(issue.status, issue.supporters),
}));
