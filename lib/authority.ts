import type { AreaContext, Authority, Category, Issue, LText, Locale } from "./types";

function L(en: string, hi: string, kn: string): LText {
  return { en, hi, kn };
}

export const areaContext: AreaContext = {
  city: L("Bengaluru", "बेंगलुरु", "ಬೆಂಗಳೂರು"),
  corporation: L("Bengaluru South City Corporation", "बेंगलुरु दक्षिण शहर निगम", "ಬೆಂಗಳೂರು ದಕ್ಷಿಣ ನಗರ ನಿಗಮ"),
  ward: L("Ward 14", "वार्ड 14", "ವಾರ್ಡ್ 14"),
  areaName: L("Jayanagar", "जयनगर", "ಜಯನಗರ"),
  boundarySource: L("Greater Bengaluru Authority ward map", "ग्रेटर बेंगलुरु प्राधिकरण वार्ड मैप", "ಗ್ರೇಟರ್ ಬೆಂಗಳೂರು ಪ್ರಾಧಿಕಾರ ವಾರ್ಡ್ ನಕ್ಷೆ"),
  authority: {
    id: "auth-bscc-w14",
    organizationName: L("Greater Bengaluru Authority", "ग्रेटर बेंगलुरु प्राधिकरण", "ಗ್ರೇಟರ್ ಬೆಂಗಳೂರು ಪ್ರಾಧಿಕಾರ"),
    departmentName: L("Ward 14 office", "वार्ड 14 कार्यालय", "ವಾರ್ಡ್ 14 ಕಚೇರಿ"),
    roleName: L("Ward Officer", "वार्ड अधिकारी", "ವಾರ್ಡ್ ಅಧಿಕಾರಿ"),
    officerName: L("Kavitha N.", "कविता एन.", "ಕವಿತಾ ಎನ್."),
    orgHandle: "@BSCC_Bengaluru",
    officerHandle: "@WardOfficer_W14",
    officerVerified: true,
    officerCurrent: true,
    wardOffice: L("Ward 14 · Jayanagar", "वार्ड 14 · जयनगर", "ವಾರ್ಡ್ 14 · ಜಯನಗರ"),
    officialContact: "1800-14-0014",
    sourceName: "Greater Bengaluru Authority",
    sourceUrl: "https://gba.karnataka.gov.in/",
    verifiedAt: "2026-08-20T10:00:00+05:30",
  },
  representatives: [
    {
      role: "councillor",
      title: L("Councillor", "पार्षद", "ಕೌನ್ಸಿಲರ್"),
      name: L("Asha Hegde", "आशा हेगड़े", "ಆಶಾ ಹೆಗಡೆ"),
      handle: "@AshaHegde_W14",
    },
    {
      role: "mla",
      title: L("MLA", "विधायक", "ಶಾಸಕ"),
      name: L("Ravi Menon", "रवि मेनन", "ರವಿ ಮೆನನ್"),
      handle: "@RaviMenon_MLA",
    },
  ],
  escalationRole: L("Zonal commissioner office", "क्षेत्रीय आयुक्त कार्यालय", "ವಲಯ ಆಯುಕ್ತರ ಕಚೇರಿ"),
  escalationOffice: L("Bengaluru South Zone", "बेंगलुरु दक्षिण क्षेत्र", "ಬೆಂಗಳೂರು ದಕ್ಷಿಣ ವಲಯ"),
};

const PWD: Authority = {
  id: "auth-pwd-roads",
  organizationName: L("Public Works Department", "लोक निर्माण विभाग", "ಲೋಕೋಪಯೋಗಿ ಇಲಾಖೆ"),
  departmentName: L("Roads division", "सड़क प्रभाग", "ರಸ್ತೆ ವಿಭಾಗ"),
  roleName: L("Assistant Executive Engineer", "सहायक कार्यपालक अभियंता", "ಸಹಾಯಕ ಕಾರ್ಯನಿರ್ವಾಹಕ ಎಂಜಿನಿಯರ್"),
  officerName: null,
  orgHandle: "@KA_PWD_Roads",
  officerVerified: false,
  officerCurrent: false,
  wardOffice: L("South zone roads", "दक्षिण क्षेत्र सड़क", "ದಕ್ಷಿಣ ವಲಯ ರಸ್ತೆ"),
  officialContact: "1800-14-0014",
  sourceName: "Asset registry · road segment",
  sourceUrl: "https://gba.karnataka.gov.in/",
  verifiedAt: "2026-08-18T09:00:00+05:30",
};

const CATEGORY_AUTHORITY: Record<Category, Omit<Authority, "id" | "officialContact" | "sourceName" | "sourceUrl" | "verifiedAt">> = {
  Roads: {
    organizationName: L("Bengaluru South City Corporation", "बेंगलुरु दक्षिण शहर निगम", "ಬೆಂಗಳೂರು ದಕ್ಷಿಣ ನಗರ ನಿಗಮ"),
    departmentName: L("Roads Engineering Department", "सड़क अभियांत्रिकी विभाग", "ರಸ್ತೆ ಎಂಜಿನಿಯರಿಂಗ್ ಇಲಾಖೆ"),
    roleName: L("Assistant Executive Engineer", "सहायक कार्यपालक अभियंता", "ಸಹಾಯಕ ಕಾರ್ಯನಿರ್ವಾಹಕ ಎಂಜಿನಿಯರ್"),
    officerName: L("Prakash Rao", "प्रकाश राव", "ಪ್ರಕಾಶ್ ರಾವ್"),
    orgHandle: "@BSCC_Bengaluru",
    officerHandle: "@AEE_RoadsW14",
    officerVerified: true,
    officerCurrent: true,
    wardOffice: L("Ward 14 engineering", "वार्ड 14 अभियांत्रिकी", "ವಾರ್ಡ್ 14 ಎಂಜಿನಿಯರಿಂಗ್"),
  },
  Waste: {
    organizationName: L("Bengaluru South City Corporation", "बेंगलुरु दक्षिण शहर निगम", "ಬೆಂಗಳೂರು ದಕ್ಷಿಣ ನಗರ ನಿಗಮ"),
    departmentName: L("Solid Waste Management", "ठोस अपशिष्ट प्रबंधन", "ಘನ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ"),
    roleName: L("Sanitary Inspector", "स्वच्छता निरीक्षक", "ನೈರ್ಮಲ್ಯ ನಿರೀಕ್ಷಕ"),
    officerName: L("Meera Joshi", "मीरा जोशी", "ಮೀರಾ ಜೋಶಿ"),
    orgHandle: "@BSCC_Bengaluru",
    officerHandle: "@SWM_InspW14",
    officerVerified: true,
    officerCurrent: true,
    wardOffice: L("Ward 14 sanitation", "वार्ड 14 स्वच्छता", "ವಾರ್ಡ್ 14 ನೈರ್ಮಲ್ಯ"),
  },
  Water: {
    organizationName: L("BWSSB", "बीडब्ल्यूएसएसबी", "ಬಿಡಬ್ಲ್ಯುಎಸ್‌ಎಸ್‌ಬಿ"),
    departmentName: L("Water supply maintenance", "जल आपूर्ति रखरखाव", "ನೀರು ಸರಬರಾಜು ನಿರ್ವಹಣೆ"),
    roleName: L("Utility Engineer", "उपयोगिता अभियंता", "ಯುಟಿಲಿಟಿ ಎಂಜಿನಿಯರ್"),
    officerName: null,
    orgHandle: "@BWSSB_Water",
    officerVerified: false,
    officerCurrent: false,
    wardOffice: L("Jayanagar service station", "जयनगर सेवा केंद्र", "ಜಯನಗರ ಸೇವಾ ಕೇಂದ್ರ"),
  },
  Drainage: {
    organizationName: L("Bengaluru South City Corporation", "बेंगलुरु दक्षिण शहर निगम", "ಬೆಂಗಳೂರು ದಕ್ಷಿಣ ನಗರ ನಿಗಮ"),
    departmentName: L("Municipal Engineering", "नगर अभियांत्रिकी", "ನಗರ ಎಂಜಿನಿಯರಿಂಗ್"),
    roleName: L("Ward Engineer", "वार्ड अभियंता", "ವಾರ್ಡ್ ಎಂಜಿನಿಯರ್"),
    officerName: L("Syed Imran", "सैयद इमरान", "ಸಯ್ಯದ್ ಇಮ್ರಾನ್"),
    orgHandle: "@BSCC_Bengaluru",
    officerHandle: "@WardEngg_W14",
    officerVerified: true,
    officerCurrent: true,
    wardOffice: L("Ward 14 engineering", "वार्ड 14 अभियांत्रिकी", "ವಾರ್ಡ್ 14 ಎಂಜಿನಿಯರಿಂಗ್"),
  },
  Lighting: {
    organizationName: L("Bengaluru South City Corporation", "बेंगलुरु दक्षिण शहर निगम", "ಬೆಂಗಳೂರು ದಕ್ಷಿಣ ನಗರ ನಿಗಮ"),
    departmentName: L("Electrical cell", "विद्युत प्रकोष्ठ", "ವಿದ್ಯುತ್ ವಿಭಾಗ"),
    roleName: L("Electrical Supervisor", "विद्युत पर्यवेक्षक", "ವಿದ್ಯುತ್ ಮೇಲ್ವಿಚಾರಕ"),
    officerName: L("Divya K.", "दिव्या के.", "ದಿವ್ಯಾ ಕೆ."),
    orgHandle: "@BSCC_Bengaluru",
    officerHandle: "@BSCC_Lights",
    officerVerified: true,
    officerCurrent: true,
    wardOffice: L("South zone electrical", "दक्षिण क्षेत्र विद्युत", "ದಕ್ಷಿಣ ವಲಯ ವಿದ್ಯುತ್"),
  },
  Traffic: {
    organizationName: L("Bengaluru Traffic Police", "बेंगलुरु यातायात पुलिस", "ಬೆಂಗಳೂರು ಟ್ರಾಫಿಕ್ ಪೊಲೀಸ್"),
    departmentName: L("Traffic signals", "यातायात सिग्नल", "ಟ್ರಾಫಿಕ್ ಸಿಗ್ನಲ್"),
    roleName: L("Traffic Inspector", "यातायात निरीक्षक", "ಟ್ರಾಫಿಕ್ ನಿರೀಕ್ಷಕ"),
    officerName: null,
    orgHandle: "@BlrTrafficDept",
    officerVerified: false,
    officerCurrent: false,
    wardOffice: L("Jayanagar traffic station", "जयनगर यातायात थाना", "ಜಯನಗರ ಟ್ರಾಫಿಕ್ ಠಾಣೆ"),
  },
  Parks: {
    organizationName: L("Bengaluru South City Corporation", "बेंगलुरु दक्षिण शहर निगम", "ಬೆಂಗಳೂರು ದಕ್ಷಿಣ ನಗರ ನಿಗಮ"),
    departmentName: L("Parks and horticulture", "उद्यान और बागवानी", "ಉದ್ಯಾನ ಮತ್ತು ತೋಟಗಾರಿಕೆ"),
    roleName: L("Park Superintendent", "पार्क अधीक्षक", "ಉದ್ಯಾನ ಅಧೀಕ್ಷಕ"),
    officerName: L("Nalini Gowda", "नलिनी गौड़ा", "ನಳಿನಿ ಗೌಡ"),
    orgHandle: "@BSCC_Bengaluru",
    officerHandle: "@BSCC_Parks",
    officerVerified: true,
    officerCurrent: true,
    wardOffice: L("Madhavan Park office", "माधवन पार्क कार्यालय", "ಮಾಧವನ್ ಪಾರ್ಕ್ ಕಚೇರಿ"),
  },
  Other: {
    organizationName: L("Bengaluru South City Corporation", "बेंगलुरु दक्षिण शहर निगम", "ಬೆಂಗಳೂರು ದಕ್ಷಿಣ ನಗರ ನಿಗಮ"),
    departmentName: L("Ward 14 office", "वार्ड 14 कार्यालय", "ವಾರ್ಡ್ 14 ಕಚೇರಿ"),
    roleName: L("Ward Officer", "वार्ड अधिकारी", "ವಾರ್ಡ್ ಅಧಿಕಾರಿ"),
    officerName: L("Kavitha N.", "कविता एन.", "ಕವಿತಾ ಎನ್."),
    orgHandle: "@BSCC_Bengaluru",
    officerHandle: "@WardOfficer_W14",
    officerVerified: true,
    officerCurrent: true,
    wardOffice: L("Ward 14 · Jayanagar", "वार्ड 14 · जयनगर", "ವಾರ್ಡ್ 14 · ಜಯನಗರ"),
  },
};

/**
 * Routing by category alone — used the moment a report is submitted, before an
 * issue record exists, so the resident sees who owns it instead of a spinner.
 */
export function authorityForCategory(category: Category, issueId = "new"): Authority {
  return {
    id: `auth-${category.toLowerCase()}-${issueId}`,
    officialContact: "1800-14-0014",
    sourceName: "Category routing · ward map",
    sourceUrl: "https://gba.karnataka.gov.in/",
    verifiedAt: areaContext.authority.verifiedAt,
    ...CATEGORY_AUTHORITY[category],
  };
}

export function resolveIssueAuthority(issue: Issue): Authority {
  if (issue.routingPending) {
    return { ...areaContext.authority, routingPending: true };
  }
  if (issue.assetOwnerId === "pwd") {
    return PWD;
  }
  const mapped = CATEGORY_AUTHORITY[issue.category];
  return {
    id: `auth-${issue.category.toLowerCase()}-${issue.id}`,
    officialContact: "1800-14-0014",
    sourceName: issue.assetOwnerId ? "Asset registry" : "Category routing · ward map",
    sourceUrl: "https://gba.karnataka.gov.in/",
    verifiedAt: issue.updatedAt,
    ...mapped,
  };
}

export function officerDisplayName(authority: Authority, locale: Locale): string | null {
  if (!authority.officerName || !authority.officerVerified || !authority.officerCurrent) return null;
  return authority.officerName[locale];
}

export function formatVerifiedDate(iso: string, locale: Locale) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale === "en" ? "en-IN" : locale === "hi" ? "hi-IN" : "kn-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
