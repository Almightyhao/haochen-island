/* -------------------------------------------------------------------------- */
/*  All site copy lives here. Edit this file to update the website.           */
/* -------------------------------------------------------------------------- */

export const profile = {
  nameZh: "曾浩宸",
  nameEn: "Hao Chen Tseng",
  initials: "HC",
  role: "Pharmacist · Researcher · Builder",
  email: "Almightyhao@mail.ndmutsgh.edu.tw",
  github: "https://github.com/Almightyhao",
  orcid: "https://orcid.org/0009-0007-0367-3269",
  /** Your own portrait. Put the file in public/photos/ — leave as is to hide. */
  portrait: "photos/S__17702918.jpg",
}

export const marquee = [
  "Whole-Exome Sequencing",
  "Primary Open-Angle Glaucoma",
  "Machine Learning",
  "Clinical Pharmacy",
  "Bioinformatics",
  "Male Infertility",
]

export const about = {
  lead:
    "我就讀於國防醫學大學藥學系（2020–2026）。自大二加入黃攸娟副教授實驗室，將藥理學訓練延伸到全外顯子定序、致病基因分析與疾病預測模型。",
  statement:
    "我持續嘗試把生物資訊、機器學習與臨床問題放在同一個框架裡思考：從家族性青光眼中的 SNP 傳遞模式，到男性不孕症相關基因，再到臨床藥局工作流程的數位化。",
  closing:
    "這些經驗讓我更重視研究能不能被理解、工具能不能被使用、結果能不能回到臨床。除了論文與研究，我也持續製作藥師工作、衛教、庫存與資料整理相關的小型網頁工具。",
  facts: [
    { k: "Education", v: "國防醫學大學 藥學系", s: "2020–2026 · 成功高中畢業市長獎" },
    { k: "Qualification", v: "藥師國考及格", s: "藥理學與臨床藥學訓練" },
    { k: "Research lab", v: "黃攸娟副教授實驗室", s: "2022–2025" },
    { k: "Core focus", v: "POAG · WES", s: "Bioinformatics · Machine Learning" },
  ],
  grant: {
    title: "113 年度國科會大專學生研究計畫",
    desc: "全外顯子定序分析探討台灣家族性原發隅角開放型青光眼易感基因基因傾向。",
  },
}

export const research = [
  {
    date: "2023 · OCT",
    title:
      "A Comprehensive Genetic Study of Microtubule-Associated Gene Clusters for Male Infertility in a Taiwanese Cohort",
    role: "第三作者",
    note: "於 2024 台灣生殖醫學會年會發表。",
  },
  {
    date: "2024 · JUN–JUL",
    title: "IPSF 亞太藥學年會（APPS）",
    role: "國內學生代表 · 泰國清萊",
    note: "參與國際藥學學生交流，拓展藥學教育與國際合作視野。",
  },
  {
    date: "2024 · AUG",
    title:
      "Activation of the ROCK/MYLK Pathway Affects Complex Molecular and Morphological Changes of the Trabecular Meshwork Associated With Ocular Hypertension",
    role: "第三作者",
    note: "於 2024 軍醫大會發表。",
  },
  {
    date: "UNDER REVIEW",
    title:
      "Exome-Based Machine Learning in Two-Affected-Generation Families Identifies Pathogenic SNPs in Early-Onset Primary Open-Angle Glaucoma",
    role: "第一作者 · First Author",
    note: "於 2025 台北醫學大學臨床醫學研究所研討會發表。",
    current: true,
  },
]

/** Your own event photos. Put the files in public/photos/ — missing files show as captions only. */
export const fieldNotes = [
  { src: "photos/409030002 曾浩宸_pages-to-jpg-0001.jpg", caption: "二代 POAG 家族機器學習預測模型口頭壁報", where: "2025 北醫大臨床醫學研究所研討會" },
  { src: "photos/IMG_9023.JPG", caption: "POAG 雙靶點抑制劑研究海報", where: "2024 軍醫大會" },
  { src: "photos/IMG_9022.JPG", caption: "男性不孕症基因研究海報", where: "2024 台灣生殖醫學會年會" },
  { src: "photos/S__17702920.jpg", caption: "國際藥學學生交流", where: "2024 IPSF APPS" },
  { src: "photos/IMG_9025.JPG", caption: "藥學系研討會", where: "Academic Exchange" },
]

export const skills = [
  "CLC Genomics Workbench",
  "Ingenuity Pathway Analysis (IPA)",
  "PCR / DNA Gel Electrophoresis",
  "TanBead Nucleic Acid Extraction",
  "Machine Learning · Python",
  "Whole-Exome Sequencing (WES)",
  "Genomics",
  "Bioinformatics",
]

export const experience = [
  { place: "三軍總醫院 臨床藥學部", what: "Clinical Pharmacy" },
  { place: "順天堂藥廠", what: "中藥炮製成分分析" },
  { place: "赫得藥局", what: "Community Pharmacy" },
]

export const projects = [
  { title: "門診儲位表查詢 App", desc: "為提升藥局工作效率而開發的網頁應用程式，方便快速查詢門診藥品儲位。", url: "https://almightyhao.github.io/OPD-Storage-Code-Finding/", tag: "Workflow" },
  { title: "住院儲位表查詢 App", desc: "為提升藥局工作效率而開發的網頁應用程式，方便快速查詢住院藥品儲位。", url: "https://almightyhao.github.io/Storage-Code-Finding/", tag: "Workflow" },
  { title: "智慧藥師 SOAP 筆記產生器", desc: "基於臨床指引，協助藥師快速生成結構化 SOAP（主觀、客觀、評估、計畫）筆記。", url: "https://almightyhao.github.io/SOAP-writter/", tag: "Clinical" },
  { title: "院內 Medispan 用藥甘特圖製圖", desc: "支援院內 Progress Note 用藥表格，迅速繪製精緻甘特圖。", url: "https://almightyhao.github.io/MediSpan/", tag: "Clinical" },
  { title: "中藥材辨認練習題庫", desc: "提供中藥材圖片辨識練習，輔助學習與記憶中藥外觀特徵。", url: "https://almightyhao.github.io/TCM-test/", tag: "Learning" },
  { title: "藥局盤點系統", desc: "匯入庫存與耗用量，評估一季安全庫存量與申領設定。", url: "https://almightyhao.github.io/Stocktaking/", tag: "Inventory" },
  { title: "仿單異動監測系統", desc: "每日比對食藥署仿單查詢異動，清楚顯示前後版更新或刪除文字。", url: "https://almightyhao.github.io/fda-monitor/", tag: "Monitoring" },
  { title: "衛教單張生成器", desc: "輸入仿單、UpToDate、Micromedex CareNotes PDF 或純文字，生成院內衛教單張。", url: "https://almightyhao.github.io/CareNotes-Generator%20/", tag: "Education" },
  { title: "AIoT 知識條目生成器", desc: "輸入 PDF 或純文字，自動化生成 AIoT 知識條目。", url: "https://almightyhao.github.io/AIoT-generator/", tag: "AI" },
  { title: "藥師筆記排版器", desc: "協助把 pharmacist's note 表格排版整齊。", url: "https://almightyhao.github.io/Table-converter/", tag: "Workflow" },
]

/** Your own certificate scans. Put the files in public/photos/ — missing files show as text cards. */
export const credentials = [
  { src: "photos/IMG_8924.PNG", title: "Google Cloud 數位人才探索學程", year: "2025" },
  { src: "photos/Google_page-0001.jpg", title: "Gemini Certified Educator", year: "2025–2028" },
  { src: "photos/34RD_B-0034_ Mr Hao-Chen Tseng.png", title: "亞太藥學年會（APPS）參與證書", year: "2024" },
  { src: "photos/itp.jpg", title: "TOEFL ITP 高等教育學術研究獎學金", year: "2025" },
]

export const awards = [
  { name: "劉孔樂先生成績優良獎學金", value: "Scholarship" },
  { name: "台灣百靈佳殷格翰藥學系成績優秀獎學金", value: "Scholarship" },
  { name: "詹益欣教育長獎學金", value: "Scholarship" },
  { name: "2025 TOEFL ITP 高等教育學術研究獎學金", value: "Scholarship" },
]

export const scores = [
  { name: "TOEFL ITP", value: "617" },
  { name: "TOEIC", value: "910" },
  { name: "ALCPT", value: "95" },
]
