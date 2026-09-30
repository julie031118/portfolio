/* Site content — identity, intro, profile, timeline, UI labels.
   UI labels are ALWAYS English (uppercase); body text follows the KO/EN toggle via {ko,en}. */
window.SITE = {
  nav: {
    wordmark: 'YEONSEO LEE',
    links: [
      { label: 'WORK', target: '#work' },
      { label: 'ABOUT', target: '#about' },
      { label: 'ARCHIVE', target: '#archive' },
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
    ui: { scroll: 'SCROLL', more: 'MORE →', hint: 'click a keyword', langAria: 'intro language' },
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
        claim: { ko: '만드는 사람의 취향이 아니라 받는 사람의 조건에서 시작합니다.', en: 'I start from the receiver’s conditions, not the maker’s taste.' },
        keyword: { ko: '받는 사람의 조건', en: 'receiver’s conditions' },
        evidence: { ko: '40–50대가 실제로 보는 릴스를 먼저 분석하고 내 취향을 버렸다 — 세 자리 조회수가 2.8만이 됐다. 미래엔수학, 2025', en: 'Analysed what women in their 40s–50s actually watch and set my taste aside — Reels went from three digits to 28K. MiraeN Math, 2025' },
        media: 'img/strength-1-miraen.jpg',
        link: 'miraen',
      },
      {
        claim: { ko: '제약을 피하지 않고 설계 조건으로 받아들입니다.', en: 'I take constraints as design conditions, not obstacles.' },
        keyword: { ko: '설계 조건', en: 'design conditions' },
        evidence: { ko: '54인치 프린터, 100인치 카프탄 — 세 패널로 나눠 찍고 봉제선에서 잇다. Wilson College Collection 영구 소장, 2026', en: 'A 54-inch printer, a 100-inch kaftan — printed in three panels that meet at the seams. Wilson College Collection, 2026' },
        media: 'img/strength-2-kaftan.jpg',
        link: 'kaftan',
      },
      {
        claim: { ko: '머릿속 그림을 AI로 바로 눈에 보이는 결과물로 만듭니다.', en: 'I turn the picture in my head into something you can see, with AI.' },
        keyword: { ko: '눈에 보이는 결과물', en: 'something you can see' },
        evidence: { ko: 'AI 단편영화를 혼자 연출해 대상. 카프탄은 자르기 전에 AI로 먼저 입혀 봤고, 이 사이트는 코딩 없이 AI와 만들었다. 2025–2026', en: 'Directed an AI short film solo — grand prize. Put the kaftan on a body with AI before cutting it, and built this site with AI, no coding background. 2025–2026' },
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

  /* Timeline — 9 segments · 33 items. item: { date, title{ko,en}, major, desc{ko,en}, link: slug|null } */
  timeline: [
    {
      segment: '2022', grade: { ko: '1학년', en: 'Year 1' },
      items: [
        { date: '2022.03', major: true, link: null,
          title: { ko: '서울대학교 의류학과 입학', en: 'Entered Seoul National University — Clothing & Textiles' },
          desc: { ko: '생활과학대학 의류학과 단일전공. 패션디자인·패션마케팅·소재를 함께 배우는 커리큘럼. 2027년 2월 졸업 예정.', en: 'BA in Clothing & Textiles, College of Human Ecology — a curriculum spanning fashion design, marketing and materials. Graduating February 2027.' } },
      ],
    },
    {
      segment: '2023', grade: { ko: '2학년', en: 'Year 2' },
      items: [
        { date: '2023.02', major: false, link: null,
          title: { ko: "밴드 '단풍' · '용감한 쿠키' — 드럼", en: "Bands 'Danpung' & 'Brave Cookie' — Drums" },
          desc: { ko: '두 밴드에서 드럼을 맡아 다섯 번 무대에 올랐다. 한 번은 2000년대 드라마 OST 메들리로 무대 전체를 구성 — 곡 사이에 드라마 대사를 넣고 다 같이 교복을 입어, 연주가 아니라 하나의 콘셉트로 보이게 만들었다. 2023.02–2024.02', en: 'Five stages across two bands. For one I built the whole set as a 2000s drama-OST medley — dialogue between songs, the band in school uniforms — so it read as a concept, not a performance. Feb 2023 – Feb 2024' } },
        { date: '2023.06', major: false, link: null,
          title: { ko: 'Imageband 영상제작 동아리 — 예능팀 기획 · 드라마팀 조연출', en: 'Imageband Film Club — Variety planning & Drama AD' },
          desc: { ko: '예능팀에서 서바이벌 두뇌게임 쇼 콘셉트를 개발하고 게임 시뮬레이션·세트 디자인·초벌 편집에 참여. 드라마팀에서는 조연출로 배우 오디션과 현장 촬영을 지원. 2023.06–2024.03', en: 'Developed a survival brain-game show concept and worked on game simulation, set design and first-pass editing. As AD on the drama team, ran actor auditions and supported shoots. Jun 2023 – Mar 2024' } },
        { date: '2023.07', major: true, link: 'campus-festival',
          title: { ko: 'SNUFESTIVAL 축제기획단 — 디자인팀 · 퍼포먼스팀', en: 'SNUFESTIVAL Committee — Design & Performance' },
          desc: { ko: '디자인팀(6인)에서 공식 캐릭터 RIO의 굿즈 라인을 총괄해 한정판 에어팟 케이스를 완판. 퍼포먼스팀(6인)에서는 버스킹·폐막식 진행과 출연자 리허설 조율. 2023.07–2024.06', en: 'In the design team (6) led the RIO merchandise line and sold out the limited-edition AirPods cases. In the performance team (6) ran busking and the closing ceremony. Jul 2023 – Jun 2024' } },
      ],
    },
    {
      segment: '2024', grade: { ko: '3학년', en: 'Year 3' },
      items: [
        { date: '2024.03', major: true, link: 'fashion-show-2024',
          title: { ko: "2024 SNU Fashion Show '형(形)' — 디자이너 · 홍보", en: "2024 SNU Fashion Show 'Hyeong' — Designer & Promotions" },
          desc: { ko: '팀 컬렉션의 콘셉트 개발과 의상 제작을 주도하고, 숏폼 영상·인스타그램·디자이너 인터뷰까지 홍보 파트를 전담. 2024.03–10', en: 'Led concept development and construction for the team collection, and owned promotion — short-form film, Instagram, designer interviews. Mar–Oct 2024' } },
        { date: '2024.03', major: false, link: 'korean-costume',
          title: { ko: '모던 한복 프로젝트', en: 'Modern Hanbok project' },
          desc: { ko: '한복 고유의 재단·봉제 기법을 서양 의복 제작 방식과 비교 분석하고, 오간자 등 한복 원단의 특성을 살려 손바느질로 직접 제작. 2024.03–06', en: 'Compared traditional hanbok cutting and sewing with Western construction, then hand-sewed a modern hanbok in organza and hanbok fabrics. Mar–Jun 2024' } },
        { date: '2024.07', major: true, link: 'sub-motion',
          title: { ko: 'SUB 서울대학교 학생방송국 — 기술팀 모션그래픽 디자이너', en: 'SUB, SNU Student Broadcasting — Motion Graphics, Technical Team' },
          desc: { ko: "After Effects로 타이포그래피 영상과 티저를 제작. 'apt (ROSÉ)' 2인, '후라이의 꿈' 4인, 'Toxic till the end' 2인 공동작업에서 모션그래픽 파트를 담당. 2024.07–2025.06", en: "Built typography films and teasers in After Effects; owned the motion-graphics part on 'apt (ROSÉ)' (2), 'Fry's Dream' (4) and 'Toxic till the end' (2). Jul 2024 – Jun 2025" } },
        { date: '2024.09', major: true, link: 'senior-fit',
          title: { ko: '관악노인종합복지관 × 서울대 협업 패션쇼 — 시니어핏', en: 'Gwanak Senior Welfare Center × SNU Fashion Show — Senior Fit' },
          desc: { ko: '어르신 한 분을 전담해 수업 밖에서까지 여러 차례 인터뷰하고, 취향과 신체적 특징을 그대로 설계 기준으로 삼아 코트를 제작. 완성작으로 시니어 런웨이까지 진행했고, 대학신문 인터뷰 대상자로 선정. 2024.09–12', en: 'Paired one-to-one with a senior model, interviewed her repeatedly beyond class hours and built a coat from her taste and body. Shown on the senior runway; interviewed by The SNU Newspaper. Sep–Dec 2024' } },
        { date: '2024.09', major: false, link: 'clo3d',
          title: { ko: "CLO 3D 액티브웨어 컬렉션 'Dopamine Dressing'", en: "CLO 3D activewear collection 'Dopamine Dressing'" },
          desc: { ko: '러닝 크루 문화를 즐기는 20대 후반 직장인 페르소나를 설계하고 WGSN 트렌드 리포트를 근거로 삼아 CLO 3D로 디자인부터 3D 시뮬레이션까지 단독 제작. 2024.09–10', en: 'A persona in late-20s running-crew culture, grounded in WGSN trend reports; designed and simulated entirely in CLO 3D, solo. Sep–Oct 2024' } },
        { date: '2024.09', major: false, link: 'unreal-engine',
          title: { ko: 'Unreal Engine 가상 패션 스튜디오', en: 'Unreal Engine virtual fashion studio' },
          desc: { ko: '캐릭터가 3D 공간 안에서 움직이고 상호작용하는 가상 패션 제작 스튜디오를 Unreal Engine으로 직접 구현. MetaHuman으로 캐릭터 생성. 2024.09–12', en: 'A virtual fashion studio in Unreal Engine with interactive 3D characters built in MetaHuman. Sep–Dec 2024' } },
        { date: '2024.11', major: true, link: 'clo3d',
          title: { ko: '입선 — 제13회 국제 디지털 패션 공모전', en: 'Selected Entry — 13th International Digital Fashion Contest' },
          desc: { ko: "한국의류산업학회 주최. CLO 3D 액티브웨어 컬렉션 'Dopamine Dressing'으로 입선. 2024.11.02", en: "Hosted by the Korean Society for Clothing Industry. Selected for the CLO 3D collection 'Dopamine Dressing'. 2 Nov 2024" } },
      ],
    },
    {
      segment: '2025-1', grade: { ko: '휴학', en: 'Leave of absence' },
      items: [
        { date: '2025.01', major: true, link: 'miraen',
          title: { ko: '미래엔수학 5개 지사 — 디자이너 & 마케터', en: 'MiraeN Math (5-district branch) — Designer & Marketer' },
          desc: { ko: 'SNS 3개 채널을 0에서 개설·운영하며 누적 50여 편의 브랜드 콘텐츠 제작. 브랜드 2D 캐릭터를 3D로 리빌드해 숏폼으로 확장. 유료광고와 네이버 스마트플레이스 SEO 병행. 릴스 최고 조회수 2.9만. 2025.01–08', en: 'Built and ran three channels from zero — 50+ pieces of brand content, the 2D brand character rebuilt in 3D for short-form, paid media alongside Naver SmartPlace SEO. Top Reel 29,000 views. Jan–Aug 2025' } },
        { date: '2025.06', major: false, link: null,
          title: { ko: "서울대 중앙도서관 디지털 리터러시 아카데미 — 'AI로 만드는 영화' 클래스", en: "SNU Central Library Digital Literacy Academy — 'Filmmaking with AI'" },
          desc: { ko: '생성형 AI를 활용한 초단편 영화 기획·제작, 프롬프트 활용, AI 영상 콘텐츠 제작 및 상영 프로젝트. 2025.06.25–27', en: 'Planning and producing a micro short film with generative AI — prompting, AI video production and a screening project. 25–27 Jun 2025' } },
        { date: '2025.07', major: true, link: 'ai-short-film',
          title: { ko: '대상 — 서울대학교 중앙도서관 AI Filmmaking Program', en: 'Grand Prize — SNU Central Library AI Filmmaking Program' },
          desc: { ko: "단편영화 'Happiness is Intelligence?' — 기획·연출·프롬프트 디렉팅·편집까지 단독 제작. 2025.07.10", en: "Short film 'Happiness is Intelligence?' — concept, direction, prompt direction and editing, all solo. 10 Jul 2025" } },
        { date: '2025.08', major: false, link: 'promo-video-ai',
          title: { ko: 'AI 영상 프로젝트 — 경주 APEC 홍보 영상 · 서울교통공사 공모전', en: 'AI video projects — Gyeongju APEC promo · Seoul Metro contest' },
          desc: { ko: '같은 AI 워크플로우로 2025 경주 APEC 특별전 홍보 영상을 제작해 경북 국제 AI 메타버스 영상 공모전에 출품. 서울교통공사 유튜브 영상 공모전에는 손그림 지하철 노선 애니메이션으로 2인 협업 출품. 2025.06–08', en: 'With the same AI workflow, made a promotional film for the 2025 APEC Special Exhibition in Gyeongju (entered in the Gyeongbuk AI/Metaverse video contest), and a two-person hand-drawn subway animation for the Seoul Metro YouTube contest. Jun–Aug 2025' } },
      ],
    },
    {
      segment: '2025-2', grade: { ko: '4학년 1학기 · 교환', en: 'Year 4-1 · Exchange' },
      items: [
        { date: '2025.08', major: true, link: null,
          title: { ko: 'NC State University, Wilson College of Textiles — 교환학생', en: 'NC State University, Wilson College of Textiles — Exchange' },
          desc: { ko: '패션 & 텍스타일 디자인. 두 학기 24학점 전 과목 A, GPA 4.0/4.0. 학기 중 현지 인턴과 캠퍼스 식당 근무를 병행하며 전 과정을 영어로. 2025.08.18–2026.06.30', en: 'Fashion & Textile Design. Straight A’s across 24 credits over two semesters, GPA 4.0/4.0, while interning and working on campus — everything in English. 18 Aug 2025 – 30 Jun 2026' } },
        { date: '2025.08', major: false, link: 'textile-printed',
          title: { ko: 'Textile Design Series — Printed · Woven · Knit', en: 'Textile Design Series — Printed · Woven · Knit' },
          desc: { ko: "한국 전통과 스트리트 컬처의 교차점을 탐구한 프린트 컬렉션 'Urban Botanica'를 NedGraphics로 디자인하고, 직조·니트까지 세 가지 제작 방식을 각각 프로젝트로 완성. 2025.08–12", en: "Designed the print collection 'Urban Botanica' in NedGraphics where Korean tradition meets street culture, then completed woven and knit projects — all three axes of textile making. Aug–Dec 2025" } },
        { date: '2025.11', major: false, link: null,
          title: { ko: 'Missions with Monty — 마케팅 & 디자인 인턴 (원격, 미국)', en: 'Missions with Monty — Marketing & Design Intern (remote, US)' },
          desc: { ko: '과학 교육 분야 게임 기반 학습 프로젝트에서 소셜미디어 콘텐츠 기획과 굿즈 제작을 맡아, 연구 인사이트를 플랫폼에 맞는 콘텐츠로 옮겨 링크드인에 직접 게시. 교수진·디자인팀과 전 과정 영어로 협업. 2025.11–2026.05', en: 'Planned social content and merchandise for a game-based science-learning project, turning research insight into platform-native posts published on LinkedIn. Collaborated with faculty and the design team in English. Nov 2025 – May 2026' } },
      ],
    },
    {
      segment: '2026-1', grade: { ko: '4학년 2학기 · 교환', en: 'Year 4-2 · Exchange' },
      items: [
        { date: '2026.01', major: false, link: null,
          title: { ko: 'BRIDGE SHOWROOM — 쇼룸 인턴 (마이애미)', en: 'BRIDGE SHOWROOM — Showroom Intern (Miami)' },
          desc: { ko: '미국 하이엔드 패션 트레이드쇼에서 3일간 부스 운영과 상품 준비를 담당하고 현지 바이어·방문객을 영어로 응대. 완성된 제품과 비주얼이 바이어 앞에서 어떻게 소비되는지 현장에서 관찰. 2026.01.29–31', en: 'Three days running a booth at a US high-end fashion trade show — preparing product and handling buyers in English. Saw first-hand how finished product and visuals land in front of a buyer. 29–31 Jan 2026' } },
        { date: '2026.01', major: true, link: 'art2wear',
          title: { ko: "Art2Wear 2026 'Tensed Symbiosis' — 웨어러블 아트 디자이너 & 런웨이 모델", en: "Art2Wear 2026 'Tensed Symbiosis' — Wearable Art Designer & Runway Model" },
          desc: { ko: '접시를 직접 깨뜨려 꽃을 만들고 나뭇가지·청키한 실·인조진주를 대비시킨 웨어러블 아트. Gregg Museum of Art & Design 런웨이에 직접 입고 올랐다. 2026.01–04', en: 'Wearable art built from hand-broken ceramic flowers set against branches, chunky yarn and faux pearls — worn on the Gregg Museum of Art & Design runway. Jan–Apr 2026' } },
        { date: '2026.01', major: true, link: 'kaftan',
          title: { ko: 'Engineered Kaftan — 디지털 프린트 텍스타일', en: 'Engineered Kaftan — digital print textile' },
          desc: { ko: '54인치 인쇄 폭 제약 안에서 100인치가 넘는 실크 카프탄을 세 패널로 분할 설계 — 이음선이 악보 모티프의 흐름을 끊지 않도록 좌표를 계산. 2026.01–04', en: 'A 100-inch silk kaftan designed in three panels for a 54-inch printer — coordinates calculated so the seams never break the flow of the score motif. Jan–Apr 2026' } },
        { date: '2026.01', major: false, link: 'adaptive-textile',
          title: { ko: 'Adaptive Textile Systems — 인테리어 텍스타일 (4인 팀)', en: 'Adaptive Textile Systems — interior textiles (team of 4)' },
          desc: { ko: '럭셔리 홈 인테리어 컬렉션. 트렌드 리서치와 브랜드 3사 분석으로 팔레트를 정하고, 번아웃 프린트·레이저 커팅·기계 자수를 인테리어급 섬유에 테스트. 2026.01–04', en: 'A luxury home-interior collection — palette set by trend research and a three-brand analysis; burn-out printing, laser-cutting and machine embroidery tested on interior-grade fibres. Jan–Apr 2026' } },
        { date: '2026.01', major: false, link: 'engineered-surfaces',
          title: { ko: 'Engineered Surfaces — 얀 디자인 · 직조 · 펀치니들', en: 'Engineered Surfaces — yarn design, weaving, punch needle' },
          desc: { ko: '섬유의 꼬임·광택·슬럽을 분석하고 방적·합사로 노벨티 얀을 직접 만든 뒤, 펀치니들·직조·편성으로 원사 구조가 드레이프와 밀도를 어디까지 결정하는지 확인. 2026.01–04', en: 'Analysed twist, lustre and slub, spun and plied custom novelty yarns, then tested through punch needle, weaving and knitting how yarn geometry dictates drape and density. Jan–Apr 2026' } },
        { date: '2026.04', major: true, link: 'kaftan',
          title: { ko: 'Wilson College Collection 영구 소장작 선정', en: 'Selected for the Wilson College Collection (permanent)' },
          desc: { ko: '담당 교수 추천으로 수업 대표 출품된 Engineered Kaftan이 교수진 심사를 거쳐 NC State Wilson College of Textiles Collection 영구 소장작으로 선정. 2026.04.25', en: 'Entered as the class representative on faculty recommendation, the Engineered Kaftan was selected by the faculty jury for permanent inclusion in the NC State Wilson College of Textiles Collection. 25 Apr 2026' } },
      ],
    },
    {
      segment: '2026 Summer', grade: { ko: '', en: '' },
      items: [
        { date: '2026.05', major: true, link: null,
          title: { ko: 'The Nonwovens Institute, NC State — 연구실 인턴', en: 'The Nonwovens Institute, NC State — Research Intern' },
          desc: { ko: '글로벌 스포츠 브랜드와 협력한 스판덱스 원사 샘플 테스트를 담당해 인장시험기로 신축성과 무게를 측정하고 영어로 결과 보고. 크리스마스트리 농가용 부직포 보호 커버의 재단 패턴을 설계하고 열접합으로 샘플 제작. 2026.05.11–08.04', en: 'Ran spandex yarn tests for a project with a global sportswear brand — stretch and weight on a tensile tester, reported in English. Designed the cutting pattern for nonwoven tree-farm covers and produced heat-bonded samples. 11 May – 4 Aug 2026' } },
        { date: '2026.07', major: true, link: 'directing-a-year',
          title: { ko: '교환학생 1년을 영상으로 — 콘텐츠 시스템 기획·제작', en: 'Directing a Year Into Video — content system design' },
          desc: { ko: '1년치 촬영 분량과 방대한 실용 정보를 하나에 담지 않고, 감성 위주 10분 영상과 정보 위주 7페이지 문서로 포맷을 분리. 숏폼 30초 티저를 따로 기획하고 채널별 톤과 캡션을 다르게 설계. 2026.07–08', en: 'Split a year of footage and practical information into a ten-minute emotional film and a seven-page free document; re-planned a 30-second short-form teaser and tuned tone and captions per channel. Jul–Aug 2026' } },
      ],
    },
    {
      segment: '2026-2', grade: { ko: '5학년 1학기 · 마지막 학기', en: 'Year 5-1 · Final term' },
      items: [
        { date: '2026.09', major: false, link: null,
          title: { ko: '서울대 복귀 — 졸업 전 마지막 학기', en: 'Back at SNU — final term before graduation' },
          desc: { ko: '교환 1년을 마치고 복귀. 테크니컬 디자인 · 인공지능예술실습 · 3D 그래픽 디자인을 수강하며 졸업 전까지 쌓는 중.', en: 'Back from the exchange year, taking Technical Design, AI Art Practice and 3D Graphic Design in the last term before graduation.' } },
        { date: '2026.09', major: true, link: 'denim-2026',
          title: { ko: "입선 — 코리아 데님 디자인 공모전 2026 'Squeezed Motion'", en: "Honorable Mention — Korea Denim Design Contest 2026, 'Squeezed Motion'" },
          desc: { ko: '물감이 실이 되는 순간을 데님 위에 옮긴 작업. AI로 수십 개의 방향을 먼저 시뮬레이션한 뒤 원단을 받아 실물 한 벌을 제작. 본선을 거쳐 입선. 2026.09.23 발표', en: 'Paint becoming thread, on denim. Dozens of directions simulated with AI before one garment was built from the delivered fabric — finalist, then Honorable Mention. Announced 23 Sep 2026' } },
        { date: '2026.09', major: true, link: 'arts-week-2026',
          title: { ko: '2026 서울대 예술주간 〈공생 Tensed Symbiosis〉 — 야외 설치', en: "SNU Arts Week 2026 'Tensed Symbiosis' — outdoor installation" },
          desc: { ko: 'Art2Wear 작업을 야외 가변설치로 재구성. 깨진 도자기 파편, 마른 꽃, 나뭇가지, 인조진주, 마네킹. 학생회관과 관정관 사이 잔디. 2026.09.28–10.02', en: 'The Art2Wear piece rebuilt as an outdoor site installation — ceramic shards, dried flowers, branches, faux pearls, mannequin — on the lawn between the Student Union and Kwanjeong Library. 28 Sep – 2 Oct 2026' } },
        { date: '2026.09', major: false, link: 'technical-design',
          title: { ko: '테크니컬 디자인 — 테크니컬 패키지 개발', en: 'Technical Design — building a tech pack' },
          desc: { ko: '본사와 생산 현장을 잇는 작업지시서 개발. 측정·사이즈·그레이딩, 원단·재단, 부자재, 라벨·패키징, 프로토타입 평가까지. 최종 발표 12월.', en: 'Building the technical package that connects HQ and the factory floor — measuring, sizing and grading, fabric, trims, labels and packaging, prototype evaluation. Final presentation in December.' } },
        { date: '2026.09', major: false, link: 'ai-art-practice',
          title: { ko: '인공지능예술실습 — 생성 모델 학습 · 12월 과제전', en: 'AI Art Practice — training generative models · December show' },
          desc: { ko: '코딩 경험 없이 시작해 직접 모은 데이터로 CNN과 생성 모델을 학습시키고, ComfyUI 노드 워크플로우로 이미지 생성 과정을 단계별로 해체. 12월 과제전 출품 목표.', en: 'Starting with no coding background — training CNNs and generative models on self-collected data and taking image generation apart as a ComfyUI node workflow. Aiming for the December show.' } },
        { date: '2026.09', major: false, link: '3d-graphic-design',
          title: { ko: '3D 그래픽 디자인 — Blender + AI', en: '3D Graphic Design — Blender + AI' },
          desc: { ko: 'AI와 Blender를 함께 쓰는 3D 제작. CLO 3D·Unreal Engine 경험 위에 3D 역량을 한 겹 더 쌓는 중.', en: '3D production combining AI tools and Blender — another layer on top of CLO 3D and Unreal Engine.' } },
      ],
    },
    {
      segment: '2027', grade: { ko: '', en: '' },
      items: [
        { date: '2027.02', major: true, link: null,
          title: { ko: '졸업 예정 — 서울대학교 의류학과', en: 'Graduation (expected) — SNU Clothing & Textiles' },
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
      { label: 'AI WORKS', tag: 'AI' }, { label: 'INSIGHT', tag: 'INSIGHT' }, { label: 'NOW', tag: 'NOW' },
    ],
  },
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
    'portfolio-site': 'images/projects/portfolio-site/01.jpg',
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
  detail: { resultTbc: 'RESULT — TO BE CONFIRMED' },
  detailUi: { heroSlot: 'IMAGE 16:9', gallerySlot: 'IMAGE', period: 'PERIOD', role: 'ROLE', need: 'NEED', action: 'ACTION', result: 'RESULT', gallery: 'GALLERY', process: { ko: '작업과정', en: 'PROCESS' }, film: 'FILM', press: 'PRESS', soundtrack: 'SOUNDTRACK', close: 'CLOSE', closeExpanded: 'CLOSE −' },
};
