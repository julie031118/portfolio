/* Site content — identity, intro, profile, timeline, UI labels.
   UI labels are ALWAYS English (uppercase); body text follows the KO/EN toggle via {ko,en}. */
window.SITE = {
  nav: {
    wordmark: 'YEONSEO LEE',
    links: [
      { label: 'INTRO', target: '#intro' },
      { label: 'WORK', target: '#work' },
      { label: 'ABOUT', target: '#about' },
      { label: 'ARCHIVE', target: '#archive' },
      { label: 'NOW', target: '#now' },
      { label: 'CONTACT', target: '#contact' },
    ],
    language: { ko: 'KO/EN', en: 'EN/KO' },
    sound: 'SOUND OFF',
    soundOn: 'SOUND ON',
    soundOff: 'SOUND OFF',
    languageAria: 'Toggle language',
    soundAria: 'Toggle typewriter sound',
    detailClose: 'CLOSE',
  },

  sections: {
    intro: { title: 'INTRO', index: '01 / 06' },
    work: { title: 'SELECTED WORK', index: '02 / 06' },
    name: { title: 'NAME' },
    about: { title: 'ABOUT', index: '03 / 06' },
    archive: { title: 'ARCHIVE', index: '04 / 06' },
    contact: { title: 'CONTACT' },
  },

  intro: {
    /* the paragraph has its own language, apart from the site toggle — it opens in English */
    defaultLang: 'en',
    lines: {
      ko: ['안녕하세요', '이연서입니다.', '저는 사람들의 눈길이 어디에 머무르는지', '마음이 어디서 움직이는지 읽고', '이를 비주얼 언어로 설계하여', '벅차오르는 순간을 만들고자 합니다.'],
      en: ['Hello,', "I'm Yeonseo Lee.", 'I read where eyes linger,', 'where hearts move,', 'and design it into visual language', 'to make moments that stay.'],
    },
    /* the full paragraph at the end — same lines, with the commas the typed version leaves out */
    finalLines: {
      ko: ['안녕하세요', '이연서입니다.', '저는 사람들의 눈길이 어디에 머무르는지,', '마음이 어디서 움직이는지 읽고,', '이를 비주얼 언어로 설계하여', '벅차오르는 순간을 만들고자 합니다.'],
      en: ['Hello,', "I'm Yeonseo Lee.", 'I read where eyes linger,', 'where hearts move,', 'and design it into visual language', 'to make moments that stay.'],
    },
    paragraph: {
      ko: '안녕하세요, 이연서입니다. 저는 사람들의 눈길이 어디에 머무르는지, 사람들의 마음이 어디서 움직이는지 읽고, 이를 비주얼 언어로 설계하여 벅차오르는 순간을 만들고자 합니다.',
      en: "Hello, I'm Yeonseo Lee. I read where eyes linger and where hearts move, and design it into visual language to make moments that stay.",
    },
    keywords: [
      { key: 'insight', text: { ko: '사람들의 눈길이 어디에 머무르는지, 사람들의 마음이 어디서 움직이는지 읽고', en: 'read where eyes linger and where hearts move' }, fragments: { ko: ['저는 사람들의 눈길이 어디에 머무르는지,', '마음이 어디서 움직이는지 읽고,'], en: ['I read where eyes linger,', 'where hearts move,'] }, branch: 'INSIGHT', tag: 'INSIGHT' },
      { key: 'visual', text: { ko: '비주얼 언어', en: 'visual language' }, branch: ['FASHION', 'CONTENT'], tag: ['FASHION', 'CONTENT'] },
      { key: 'design', text: { ko: '설계', en: 'design' }, branch: 'AI WORKS', tag: 'AI' },
    ],
    ui: { scroll: 'SCROLL', more: 'MORE →', hint: { en: 'hover over the underlined words', ko: '밑줄 친 단어에 마우스를 올려 보세요' }, langAria: 'intro language' },
    /* the handwritten sub-notes around the hand-drawn labels (연서's mind map, 2026-10) */
    notes: {
      insight: ['research', 'interview', 'targeting', 'marketing', 'trend', 'audience'], /* the elbow line runs toward the 4th */
      fashion: ['fashion design', 'textile design', 'digital fashion', 'wearable art', 'fashion show', 'adaptive design'],
      contents: ['short film', 'design', 'motion graphics', 'website', 'video', 'promo'],
      ai: ['moodboards', 'ideation', 'prototype', 'vibe coding', '3D assets', 'graphics', 'video'], /* in working order */
      aiTag: 'also this portfolio!',
    },
  },

  profile: {
    name: { ko: '이연서', en: 'Yeonseo Lee' },
    photo: 'img/profile-3.jpg',
    photos: ['img/profile-3.jpg', 'img/profile-1.jpg', 'img/profile-2.jpg'], /* stacked collage — order: big portrait, selfie, café */
    photoAlt: { ko: '이연서 프로필 사진', en: 'Portrait of Yeonseo Lee' },
    email: 'julie031118@gmail.com',
    linkedin: 'https://www.linkedin.com/in/yeonseo-lee-64b970388/',

    /* 3 strengths — claim (serif) + evidence (mono). `keyword` must appear verbatim inside `claim`;
       hovering it pops `media` (4:5), clicking opens `link`. */
    strengths: [
      {
        claim: { ko: '제 취향을 고집하지 않고, 보는 사람과 콘셉트에 맞춰 비주얼을 바꿉니다.', en: 'I don’t hold on to my own taste. I shape the visuals around the audience and the concept.' },
        keyword: { ko: '보는 사람과 콘셉트', en: 'the audience and the concept' },
        evidence: { ko: '40~50대가 실제로 보는 릴스를 먼저 분석해 세 자리 조회수를 2.8만으로 올렸다. 미래엔수학, 2025 · 어르신 한 분을 여러 번 만나 굽은 등과 어깨 비대칭에 맞춰 코트를 설계했다. 인체공학적 의복디자인, 2024', en: 'Studied the Reels women in their 40s and 50s actually watch; views went from three digits to 28K. MiraeN Math, 2025 · Met one senior model several times and cut his coat around a curved back and uneven shoulders. Ergonomic Clothing Design, 2024' },
        media: 'img/strength-1-miraen.jpg',
        link: 'miraen',
      },
      {
        claim: { ko: '머리로 기획하고, 몸으로 끝까지 만듭니다.', en: 'I plan it in my head and build it all the way through with my hands.' },
        keyword: { ko: '몸으로 끝까지', en: 'all the way through' },
        evidence: { ko: '54인치 프린터로 100인치 카프탄을 세 패널로 나눠 찍어 Wilson College Collection 영구 소장. Art2Wear 〈공생〉은 디자인과 제작부터 런웨이 모델까지 맡았다. 교환학생 1년 동안 인턴 3곳과 아르바이트를 병행하면서 전 과목 A(GPA 4.0). 2025~2026', en: 'Printed a 100-inch kaftan on a 54-inch printer in three panels; it is now in the Wilson College Collection. Took Art2Wear’s Tensed Symbiosis from design and construction to walking it on the runway. One exchange year with three internships and a part-time job alongside, and straight A’s (GPA 4.0). 2025 to 2026' },
        media: 'img/strength-2-kaftan.jpg',
        link: 'kaftan',
      },
      {
        claim: { ko: '머릿속 그림을 AI로 바로 눈에 보이는 결과물로 만듭니다.', en: 'I turn the picture in my head into something you can see, with AI.' },
        keyword: { ko: '눈에 보이는 결과물', en: 'something you can see' },
        evidence: { ko: 'AI 단편영화를 혼자 연출해 대상. 카프탄과 데님은 자르기 전에 AI로 먼저 입혀 봤다. 지금 보고 있는 이 포트폴리오도 코딩 없이 AI와 함께 기획부터 구현까지 직접 만들었다. 더 섬세하게 다루고 싶어서, 인공지능예술실습에서 생성 모델을 직접 학습시키며 원리부터 배우는 중. 2025~2026', en: 'Directed an AI short film solo and won the grand prize. Tried the kaftan and the denim on a body with AI before cutting. And this portfolio you are looking at: planned and built with AI from concept to code, with no coding background. To get finer control, I am now training generative models myself in Deep Learning for Artists. 2025 to 2026' },
        media: 'images/projects/ai-short-film/11.jpg',
        link: 'ai-short-film',
      },
    ],

    stats: [
      { v: '3.9 / 4.3', l: 'GPA · Seoul National University' },
      { v: '4.0 / 4.0', l: 'GPA · NC State University (Exchange)' },
      { v: '4', l: 'AWARDS' },
    ],

    skills: [
      { group: { ko: '콘텐츠 · 영상', en: 'Content & Film' }, items: ['Premiere Pro', 'After Effects', 'CapCut', { ko: '채널 운영 · 유료광고', en: 'Channel ops & paid media' }, { ko: '숏폼 기획', en: 'Short-form planning' }] },
      { group: { ko: 'AI', en: 'AI' }, items: ['Midjourney', 'Kling AI', 'Suno', 'ElevenLabs', 'ComfyUI', { ko: '2D→3D 캐릭터 변환', en: '2D→3D character conversion' }] },
      { group: { ko: '패션 · 텍스타일', en: 'Fashion & Textile' }, items: ['CLO 3D', 'Blender', 'NedGraphics', { ko: '엔지니어드 프린트', en: 'Engineered print' }, { ko: '제직·편직·날염', en: 'Weaving, knitting, printing' }, { ko: '패턴 · 봉제', en: 'Pattern & construction' }] },
      { group: { ko: '디자인', en: 'Design' }, items: ['Photoshop', 'Illustrator', 'InDesign', { ko: '브랜딩 · 캐릭터 전개', en: 'Branding & character systems' }] },
    ],
  },

  /* Timeline by semester: 10 segments · 20 items (2026-10-01). Keep an item only if it is a turning point (school, exchange, graduation),
     a role (job, internship, club), or an outside result (award, selection, collection, show, exhibition). Class and solo work without
     an outside result lives in the archive; this term's courses live in NOW. item: { date, until (end month, when it ran longer), title{ko,en}, major, desc{ko,en}, link: slug|null } */
  /* duration lines under the spine for items that ran across semesters (built, off until 연서 says yes) */
  timelineSpans: false,
  timeline: [
    {
      segment: '2022', grade: { ko: '1학년', en: 'Year 1' },
      items: [
        { date: '2022.03', major: true, link: null,
          title: { ko: '서울대학교 의류학과 입학', en: 'Entered Seoul National University: Clothing & Textiles' },
          desc: { ko: '생활과학대학 의류학과 단일전공. 패션디자인·패션마케팅·소재를 함께 배우는 커리큘럼. 2027년 2월 졸업 예정.', en: 'BA in Clothing & Textiles, College of Human Ecology, a curriculum spanning fashion design, marketing and materials. Graduating February 2027.' } },
      ],
    },
    {
      segment: '2023-1', grade: { ko: '2학년 1학기', en: 'Year 2-1' },
      items: [
        { date: '2023.02', until: '2024.02', major: false, link: null,
          title: { ko: '밴드 \'단풍\' · \'용감한 쿠키\': 드럼', en: 'Bands \'Danpung\' & \'Brave Cookie\': Drums' },
          desc: { ko: '두 밴드에서 드럼을 맡아 다섯 번 무대에 올랐다. 한 번은 2000년대 드라마 OST 메들리로 무대 전체를 구성했다. 곡 사이에 드라마 대사를 넣고 다 같이 교복을 입어, 연주가 아니라 하나의 콘셉트로 보이게 만들었다. 2023.02~2024.02', en: 'Five stages across two bands. For one I built the whole set as a 2000s drama-OST medley (dialogue between songs, the band in school uniforms) so it read as a concept, not a performance. Feb 2023 to Feb 2024' } },
        { date: '2023.06', until: '2024.03', major: false, link: null,
          title: { ko: 'Imageband 영상제작 동아리: 예능팀 기획 · 드라마팀 조연출', en: 'Imageband Film Club: Variety planning & Drama AD' },
          desc: { ko: '예능팀에서 서바이벌 두뇌게임 쇼 콘셉트를 개발하고 게임 시뮬레이션·세트 디자인·초벌 편집에 참여. 드라마팀에서는 조연출로 배우 오디션과 현장 촬영을 지원. 2023.06~2024.03', en: 'Developed a survival brain-game show concept and worked on game simulation, set design and first-pass editing. As AD on the drama team, ran actor auditions and supported shoots. Jun 2023 to Mar 2024' } },
      ],
    },
    {
      segment: '2023-2', grade: { ko: '2학년 2학기', en: 'Year 2-2' },
      items: [
        { date: '2023.07', until: '2024.06', major: true, link: 'campus-festival',
          title: { ko: 'SNUFESTIVAL 축제기획단: 디자인팀 · 퍼포먼스팀', en: 'SNUFESTIVAL Committee: Design & Performance' },
          desc: { ko: '디자인팀(6인) 팀원으로 공식 캐릭터 RIO의 굿즈를 디자인해 한정판 에어팟 케이스를 완판. 퍼포먼스팀(6인)에서는 버스킹·폐막식 진행과 출연자 리허설 조율. 2023.07~2024.06', en: 'In the design team (6), designed RIO merchandise and sold out the limited-edition AirPods cases. In the performance team (6) ran busking and the closing ceremony. Jul 2023 to Jun 2024' } },
      ],
    },
    {
      segment: '2024-1', grade: { ko: '3학년 1학기', en: 'Year 3-1' },
      items: [
        { date: '2024.03', until: '2024.10', major: true, link: 'fashion-show-2024',
          title: { ko: '2024 SNU Fashion Show \'형(形)\': 디자이너 · 홍보', en: '2024 SNU Fashion Show \'Hyeong\': Designer & Promotions' },
          desc: { ko: '팀 컬렉션의 콘셉트 개발과 의상 제작을 주도하고, 숏폼 영상·인스타그램·디자이너 인터뷰까지 홍보 파트를 전담. 2024.03~10', en: 'Led concept development and construction for the team collection, and owned promotion (short-form film, Instagram, designer interviews). Mar to Oct 2024' } },
      ],
    },
    {
      segment: '2024-2', grade: { ko: '3학년 2학기', en: 'Year 3-2' },
      items: [
        { date: '2024.07', until: '2025.06', major: true, link: 'sub-motion',
          title: { ko: 'SUB 서울대학교 학생방송국: 기술팀 모션그래픽 디자이너', en: 'SUB, SNU Student Broadcasting: Motion Graphics, Technical Team' },
          desc: { ko: 'After Effects로 타이포그래피 영상과 티저를 제작. \'apt (ROSÉ)\' 2인, \'후라이의 꿈\' 4인(조장), \'Toxic till the end\' 4인 공동작업에서 모션그래픽을 파트별로 나눠 작업. 2024.07~2025.06', en: 'Built typography films and teasers in After Effects; split the motion graphics by part on \'apt (ROSÉ)\' (team of 2), \'Fry\'s Dream\' (team of 4, team lead) and \'Toxic till the end\' (team of 4). Jul 2024 to Jun 2025' } },
        { date: '2024.09', until: '2024.12', major: true, link: 'senior-fit',
          title: { ko: '관악노인종합복지관 × 서울대 협업 패션쇼: 시니어핏', en: 'Gwanak Senior Welfare Center × SNU Fashion Show: Senior Fit' },
          desc: { ko: '어르신 한 분을 전담해 수업 밖에서까지 여러 차례 인터뷰하고, 취향과 신체적 특징을 그대로 설계 기준으로 삼아 코트를 제작. 완성작으로 시니어 런웨이까지 진행했고, 대학신문 인터뷰 대상자로 선정. 2024.09~12', en: 'Paired one-to-one with a senior model, interviewed him repeatedly beyond class hours and built a coat from his taste and body. Shown on the senior runway; interviewed by The SNU Newspaper. Sep to Dec 2024' } },
        { date: '2024.11', major: true, link: 'clo3d',
          title: { ko: '입선: 제13회 국제 디지털 패션 공모전', en: 'Selected Entry: 13th International Digital Fashion Contest' },
          desc: { ko: '한국의류산업학회 주최. 러닝 크루 문화를 즐기는 20대 후반 직장인 페르소나를 WGSN 트렌드 리포트로 설계하고, CLO 3D로 디자인부터 3D 시뮬레이션까지 단독 제작한 액티브웨어 컬렉션 \'Dopamine Dressing\'으로 입선. 2024.09~11', en: 'Hosted by the Korean Society for Clothing Industry. \'Dopamine Dressing\', an activewear collection for a late-20s running-crew persona grounded in WGSN trend reports, designed and simulated solo in CLO 3D. Sep to Nov 2024' } },
      ],
    },
    {
      segment: '2025-1', grade: { ko: '휴학', en: 'Leave of absence' },
      items: [
        { date: '2025.01', until: '2025.08', major: true, link: 'miraen',
          title: { ko: '미래엔수학 5개 지사: 디자이너 & 마케터', en: 'MiraeN Math (5-district branch): Designer & Marketer' },
          desc: { ko: 'SNS 3개 채널을 0에서 개설·운영하며 누적 50여 편의 브랜드 콘텐츠 제작. 브랜드 2D 캐릭터를 3D로 리빌드해 숏폼으로 확장. 유료광고와 네이버 스마트플레이스 SEO 병행. 릴스 최고 조회수 2.9만. 2025.01~08', en: 'Built and ran three channels from zero: 50+ pieces of brand content, the 2D brand character rebuilt in 3D for short-form, paid media alongside Naver SmartPlace SEO. Top Reel 29,000 views. Jan to Aug 2025' } },
        { date: '2025.07', major: true, link: 'ai-short-film',
          title: { ko: '대상: 서울대학교 중앙도서관 AI Filmmaking Program', en: 'Grand Prize: SNU Central Library AI Filmmaking Program' },
          desc: { ko: '디지털 리터러시 아카데미 \'AI로 만드는 영화\' 클래스(2025.06)를 들은 뒤, 단편영화 \'Happiness is Intelligence?\'를 기획·연출·프롬프트 디렉팅·편집까지 단독 제작. 2025.07.10', en: 'After the Digital Literacy Academy class \'Filmmaking with AI\' (Jun 2025), made the short film \'Happiness is Intelligence?\' solo: concept, direction, prompt direction and editing. 10 Jul 2025' } },
      ],
    },
    {
      segment: '2025-2', grade: { ko: '4학년 1학기 · 교환', en: 'Year 4-1 · Exchange' },
      items: [
        { date: '2025.08', until: '2026.06', major: true, link: null,
          title: { ko: 'NC State University, Wilson College of Textiles: 교환학생', en: 'NC State University, Wilson College of Textiles: Exchange' },
          desc: { ko: '패션 & 텍스타일 디자인. 두 학기 24학점 전 과목 A, GPA 4.0/4.0. 학기 중 현지 인턴과 캠퍼스 식당 근무를 병행하며 전 과정을 영어로. 2025.08.18~2026.06.30', en: 'Fashion & Textile Design. Straight A’s across 24 credits over two semesters, GPA 4.0/4.0, while interning and working on campus, everything in English. 18 Aug 2025 to 30 Jun 2026' } },
        { date: '2025.11', until: '2026.05', major: false, link: null,
          title: { ko: 'Missions with Monty: 마케팅 & 디자인 인턴 (원격, 미국)', en: 'Missions with Monty: Marketing & Design Intern (remote, US)' },
          desc: { ko: '과학 교육 분야 게임 기반 학습 프로젝트에서 소셜미디어 콘텐츠 기획과 굿즈 제작을 맡아, 연구 인사이트를 플랫폼에 맞는 콘텐츠로 옮겨 링크드인에 직접 게시. 교수진·디자인팀과 전 과정 영어로 협업. 2025.11~2026.05', en: 'Planned social content and merchandise for a game-based science-learning project, turning research insight into platform-native posts published on LinkedIn. Collaborated with faculty and the design team in English. Nov 2025 to May 2026' } },
      ],
    },
    {
      segment: '2026-1', grade: { ko: '4학년 2학기 · 교환', en: 'Year 4-2 · Exchange' },
      items: [
        { date: '2026.01', major: false, link: null,
          title: { ko: 'BRIDGE SHOWROOM: 쇼룸 인턴 (마이애미)', en: 'BRIDGE SHOWROOM: Showroom Intern (Miami)' },
          desc: { ko: '미국 하이엔드 패션 트레이드쇼에서 3일간 부스 운영과 상품 준비를 담당하고 현지 바이어·방문객을 영어로 응대. 완성된 제품과 비주얼이 바이어 앞에서 어떻게 소비되는지 현장에서 관찰. 2026.01.29~31', en: 'Three days running a booth at a US high-end fashion trade show, preparing product and handling buyers in English. Saw first-hand how finished product and visuals land in front of a buyer. 29 to 31 Jan 2026' } },
        { date: '2026.01', until: '2026.04', major: true, link: 'art2wear',
          title: { ko: 'Art2Wear 2026 \'Tensed Symbiosis\': 웨어러블 아트 디자이너 & 런웨이 모델', en: 'Art2Wear 2026 \'Tensed Symbiosis\': Wearable Art Designer & Runway Model' },
          desc: { ko: '접시를 직접 깨뜨려 꽃을 만들고 나뭇가지·청키한 실·인조진주를 대비시킨 웨어러블 아트. Gregg Museum of Art & Design 런웨이에 직접 입고 올랐다. 2026.01~04', en: 'Wearable art built from hand-broken ceramic flowers set against branches, chunky yarn and faux pearls, worn on the Gregg Museum of Art & Design runway. Jan to Apr 2026' } },
        { date: '2026.01', until: '2026.04', major: true, link: 'kaftan',
          title: { ko: 'Engineered Kaftan: Wilson College Collection 영구 소장', en: 'Engineered Kaftan: Wilson College Collection (permanent)' },
          desc: { ko: '54인치 인쇄 폭 안에서 100인치가 넘는 실크 카프탄을 세 패널로 나눠 설계하고, 이음선이 악보 모티프의 흐름을 끊지 않도록 좌표를 계산. 수업 대표로 출품돼 교수진 심사를 거쳐 NC State Wilson College of Textiles Collection 영구 소장작으로 선정. 2026.01~04', en: 'A 100-inch silk kaftan designed in three panels for a 54-inch printer, with coordinates calculated so the seams never break the score motif. Entered as the class representative and selected by the faculty jury for permanent inclusion in the NC State Wilson College of Textiles Collection. Jan to Apr 2026' } },
        { date: '2026.05', until: '2026.08', major: true, link: null,
          title: { ko: 'The Nonwovens Institute, NC State: 연구실 인턴', en: 'The Nonwovens Institute, NC State: Research Intern' },
          desc: { ko: '글로벌 스포츠 브랜드와 협력한 스판덱스 원사 샘플 테스트를 담당해 인장시험기로 신축성과 무게를 측정하고 영어로 결과 보고. 크리스마스트리 농가용 부직포 보호 커버의 재단 패턴을 설계하고 열접합으로 샘플 제작. 2026.05.11~08.04', en: 'Ran spandex yarn tests for a project with a global sportswear brand (stretch and weight on a tensile tester), reported in English. Designed the cutting pattern for nonwoven tree-farm covers and produced heat-bonded samples. 11 May to 4 Aug 2026' } },
      ],
    },
    {
      segment: '2026-2', grade: { ko: '5학년 1학기 · 마지막 학기', en: 'Year 5-1 · Final term' },
      items: [
        { date: '2026.09', major: false, link: null,
          title: { ko: '서울대 복귀: 졸업 전 마지막 학기', en: 'Back at SNU: final term before graduation' },
          desc: { ko: '교환 1년을 마치고 복귀. 이번 학기에 배우는 테크니컬 디자인, 인공지능예술실습, 3D 그래픽 디자인은 아카이브 아래 NOW에.', en: 'Back from the exchange year. What I am learning this term (Technical Design, Deep Learning for Artists, 3D Graphic Design) is under NOW, below the archive.' } },
        { date: '2026.09', major: true, link: 'denim-2026',
          title: { ko: '입선: 코리아 데님 디자인 공모전 2026 \'Squeezed Motion\'', en: 'Honorable Mention: Korea Denim Design Contest 2026, \'Squeezed Motion\'' },
          desc: { ko: '물감이 실이 되는 순간을 데님 위에 옮긴 작업. AI로 수십 개의 방향을 먼저 시뮬레이션한 뒤 원단을 받아 실물 한 벌을 제작. 본선을 거쳐 입선. 2026.09.23 발표', en: 'Paint becoming thread, on denim. Dozens of directions simulated with AI before one garment was built from the delivered fabric. Finalist, then Honorable Mention. Announced 23 Sep 2026' } },
        { date: '2026.09', major: true, link: 'arts-week-2026',
          title: { ko: '2026 서울대 예술주간 〈공생 Tensed Symbiosis〉: 야외 설치', en: 'SNU Arts Week 2026 \'Tensed Symbiosis\': outdoor installation' },
          desc: { ko: 'Art2Wear 작업을 야외 가변설치로 재구성. 깨진 도자기 파편, 마른 꽃, 나뭇가지, 인조진주, 마네킹. 학생회관과 관정관 사이 잔디. 2026.09.28~10.02', en: 'The Art2Wear piece rebuilt as an outdoor site installation (ceramic shards, dried flowers, branches, faux pearls, a mannequin) on the lawn between the Student Union and Kwanjeong Library. 28 Sep to 2 Oct 2026' } },
      ],
    },
    {
      segment: '2027', grade: { ko: '졸업', en: 'Graduation' },
      items: [
        { date: '2027.02', major: true, link: null,
          title: { ko: '졸업 예정: 서울대학교 의류학과', en: 'Graduation (expected): SNU Clothing & Textiles' },
          desc: { ko: '학사 졸업 예정. 학점 3.9 / 4.3.', en: 'BA expected. GPA 3.9 / 4.3.' } },
      ],
    },
  ],

  /* ---- UI labels (English only) ---- */
  loader: { drag: 'DRAG TO OPEN', tap: 'TAP TO OPEN', objectLabel: '3D OBJECT' },
  name: { title: 'YEONSEO LEE', disciplines: 'FASHION · CONTENT · AI · INSIGHT', caption: '02 / NAME' },
  workUi: { imageSlot: 'IMAGE 3:4', objectLabel: '3D OBJECT', hint: 'SCROLL TO ROTATE · CLICK TO OPEN' },
  aboutUi: { strengths: 'STRENGTHS', profile: 'PROFILE', stats: 'KEY FIGURES', timeline: 'TIMELINE', segments: 'SEGMENTS', skills: 'SKILLS', openProject: 'OPEN PROJECT →', photoSlot: 'IMAGE 3:4', mediaSlot: 'MEDIA 4:5' },
  archiveUi: {
    filterLabel: 'ARCHIVE FILTERS', imageSlot: 'IMAGE 3:4', inProgress: 'IN PROGRESS',
    filters: [
      { label: 'ALL', tag: null }, { label: 'FASHION', tag: 'FASHION' }, { label: 'CONTENT', tag: 'CONTENT' },
      { label: 'AI WORKS', tag: 'AI' }, { label: 'INSIGHT', tag: 'INSIGHT' },
    ],
  },
  /* NOW: what I am learning this term. Sits under the archive grid (#now), same weight as the 3 strengths.
     Facts from 연서's class notes (Notion, weeks 1 to 5). The class show was cancelled by vote: do not mention it. */
  nowUi: { title: 'NOW', index: 'FALL 2026', lead: { ko: '졸업 전 마지막 학기에 배우는 것들과, 12월 종강까지 해낼 것.', en: 'What I am learning in my final term, and what I will have done by December.' }, next: { ko: '12월까지', en: 'By December' } },
  now: [
    {
      label: { ko: '인공지능예술실습 · 2026 가을학기', en: 'Deep Learning for Artists · Fall 2026' },
      claim: { ko: 'AI를 툴로만 쓰지 않고, 이미지 AI가 작동하는 원리부터 배우고 있습니다.', en: 'Learning how image AI works underneath, not just how to use the tools.' },
      evidence: { ko: 'AI로 창작하며 더 섬세하게 다루고 싶어 들은 수업. 미드저니로 만든 얼굴 이미지로 Claude Code와 함께 PyTorch에서 생성 모델(GAN)을 직접 학습시켜, 얼굴 사이를 걷는 latent travel 영상을 만들었다. 다음은 ComfyUI와 클라우드 GPU(RunPod).', en: 'I make things with AI and wanted finer control. I generated face images in Midjourney, trained a generative model (GAN) on them in PyTorch with Claude Code, and made a latent travel video that walks from face to face. Next: ComfyUI and cloud GPUs (RunPod).' },
      /* 연서's own run (week 4): every training image was made in Midjourney, so no real faces */
      media: { webm: 'images/now/latent-travel.webm', video: 'images/now/latent-travel.mp4', poster: 'images/now/latent-travel.jpg', caption: { ko: 'latent travel · 직접 학습시킨 모델', en: 'latent travel · the model I trained' } },
      next: { ko: '내 데이터로 모델을 조정해 최종 프로젝트를 완성합니다.', en: 'Tune a model with my own data and finish the final project.' },
    },
    {
      label: { ko: '테크니컬 디자인 · 2026 가을학기', en: 'Technical Design · Fall 2026' },
      claim: { ko: '디자인을 공장이 읽을 수 있는 언어로 옮기는 법을 배우고 있습니다.', en: 'Learning to translate a design into the language a factory can read.' },
      evidence: { ko: '디자이너는 실루엣으로, 공장은 치수와 봉제 사양으로 말한다. 그 사이를 잇는 테크니컬 패키지(작업지시서)를 매주 과제로 쌓는 중.', en: 'A designer talks in silhouettes; a factory, in measurements and construction specs. Building the tech pack that connects the two, one weekly assignment at a time.' },
      next: { ko: '치수와 그레이딩, 원단, 부자재, 라벨, 샘플 평가까지 마치고 최종 발표. 같은 범위인 테크니컬디자이너 3급 응시도 검토 중입니다.', en: 'Grading, fabric, trims, labels and prototype evaluation, then the final presentation. Considering the Technical Designer Level 3 exam, which covers the same ground.' },
    },
    {
      label: { ko: '3D 그래픽 디자인 · 2026 가을학기', en: '3D Graphic Design · Fall 2026' },
      claim: { ko: 'Blender와 AI를 함께 쓰는 3D 그래픽디자인을 배우고 있습니다.', en: 'Learning 3D graphic design with Blender and AI together.' },
      evidence: { ko: 'AI가 만든 3D를 디자이너의 눈으로 가려내고 완성하는 법을 배우는 수업. Blender로 조형, 라이팅과 렌더링, 질감을 익히는 중.', en: 'A class on judging the 3D that AI makes and finishing it with a designer’s eye. Working through form, lighting, rendering and materials in Blender.' },
      next: { ko: '3D 타이포 포스터와 아이콘 세트를 거쳐, 톤앤매너가 통일된 3D 그래픽 시리즈를 완성합니다.', en: 'A 3D type poster and an icon set, then a 3D graphic series in one tone and manner.' },
    },
  ],

  /* moodboard ground behind each project's detail page (photo under vellum). Keys are project slugs;
     a project without an entry falls back to the pool below, picked by its position. */
  detailGround: {
    miraen: 'images/ground/d06-dog-ai.jpg',
    kaftan: 'images/ground/01-intro.jpg',
    'ai-short-film': 'images/ground/d14-ai-film-face.jpg',
    'campus-festival': 'images/ground/04-about.jpg',
    art2wear: 'images/ground/03-name.jpg',
    'denim-2026': 'images/ground/02-work.jpg',
    'fashion-show-2024': 'images/ground/d10-runway-wide.jpg',
    'directing-a-year': 'images/ground/d16-wilson-collage.jpg',
    'sub-motion': 'images/ground/d01-filmstrip.jpg',
    'senior-fit': 'images/ground/d11-sewing-ruffles.jpg',
    'promo-video-ai': 'images/ground/d15-bad-day-still.jpg',
    'portfolio-site': 'images/projects/portfolio-site/14.jpg',
    '3d-graphic-design': 'images/ground/05-archive.jpg',
    'adaptive-textile': 'images/ground/d07-tufted-portrait.jpg',
    'ai-art-practice': 'images/ground/d06-dog-ai.jpg',
    'arts-week-2026': 'images/projects/arts-week-2026/06.jpg',
    clo3d: 'images/ground/d09-runway-blur.jpg',
    'engineered-surfaces': 'images/ground/d05-green-repeat.jpg',
    'fashion-illustration': 'images/ground/d12-popart-face.jpg',
    'korean-costume': 'images/ground/d04-rabbit-floral.jpg',
    'seoul-metro': 'images/ground/d01-filmstrip.jpg',
    'technical-design': 'images/ground/d11-sewing-ruffles.jpg',
    'textile-knit': 'images/ground/02-work.jpg',
    'textile-printed': 'images/ground/d02-fox-floral.jpg',
    'textile-woven': 'images/ground/d13-woven-pink.jpg',
    'unreal-engine': 'images/ground/d03-stripe-floral.jpg',
  },
  detailGroundPool: ['images/ground/d08-runway-stripes.jpg', 'images/ground/06-contact.jpg', 'images/ground/d03-stripe-floral.jpg', 'images/ground/d13-woven-pink.jpg'],

  /* sound: the typewriter click is synthesised; an ambient track plays on loop once SOUND is on
     (drop an mp3 at audio/ambient.mp3 — leave the path empty for no music) */
  sound: { ambient: '' },

  contactUi: { title: "LET'S TALK.", linkedin: 'LINKEDIN ↗', imageSlot: 'IMAGE 16:9', caption: '05 / 06', footerLeft: '© 2026 YEONSEO LEE' },
  detail: { resultTbc: 'RESULT: TO BE CONFIRMED' },
  detailUi: { heroSlot: 'IMAGE 16:9', gallerySlot: 'IMAGE', period: 'PERIOD', role: 'ROLE', need: 'NEED', action: 'ACTION', result: 'RESULT', gallery: 'GALLERY', process: { ko: '작업과정', en: 'PROCESS' }, film: 'FILM', watch: { ko: 'YouTube에서 보기 ↗', en: 'Watch on YouTube ↗' }, fullSong: { ko: 'YouTube에서 전곡 ↗', en: 'Full song on YouTube ↗' }, press: 'PRESS', soundtrack: 'SOUNDTRACK', close: 'CLOSE', closeExpanded: 'CLOSE −' },
};
