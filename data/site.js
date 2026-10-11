/* Site content — identity, intro, profile, timeline, UI labels.
   UI labels are ALWAYS English (uppercase); body text follows the KO/EN toggle via {ko,en}. */
window.SITE = {
  nav: {
    wordmark: 'YEONSEO LEE',
    links: [
      { label: 'INTRO', target: '#intro' },
      { label: 'SELECTED', target: '#work' }, /* was WORK (연서, 2026-10-02): SELECTED names the ring, ARCHIVE holds everything */
      { label: 'ABOUT', target: '#about' },
      { label: 'NOW', target: '#now' }, /* NOW moved above the archive grid (연서, 2026-10-09) */
      { label: 'ARCHIVE', target: '#archive-list' }, /* the filters, not the section top: NOW sits above them since 10-09 (fix 2026-10-10) */
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
      en: ['Hello,', "I'm Yeonseo Lee.", 'I read where eyes linger,', 'where hearts move,', 'and design it into visual language', 'to make moments that move people.'],
    },
    /* the full paragraph at the end — same lines, with the commas the typed version leaves out */
    finalLines: {
      ko: ['안녕하세요', '이연서입니다.', '저는 사람들의 눈길이 어디에 머무르는지,', '마음이 어디서 움직이는지 읽고,', '이를 비주얼 언어로 설계하여', '벅차오르는 순간을 만들고자 합니다.'],
      en: ['Hello,', "I'm Yeonseo Lee.", 'I read where eyes linger,', 'where hearts move,', 'and design it into visual language', 'to make moments that move people.'],
    },
    paragraph: {
      ko: '안녕하세요, 이연서입니다. 저는 사람들의 눈길이 어디에 머무르는지, 사람들의 마음이 어디서 움직이는지 읽고, 이를 비주얼 언어로 설계하여 벅차오르는 순간을 만들고자 합니다.',
      en: "Hello, I'm Yeonseo Lee. I read where eyes linger and where hearts move, and design it into visual language to make moments that move people.",
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
    photos: ['img/profile-3.jpg', 'img/profile-2.jpg'], /* stacked collage: big portrait, café (the landscape selfie came out, 2026-10-02) */
    photoAlt: { ko: '이연서 프로필 사진', en: 'Portrait of Yeonseo Lee' },
    email: 'julie031118@gmail.com',
    linkedin: 'https://www.linkedin.com/in/yeonseo-lee-64b970388/',

    /* 3 strengths — claim (serif) + evidence (mono). `keyword` must appear verbatim inside `claim`;
       hovering it pops `media` (4:5), clicking opens `link`. */
    strengths: [ /* 2026-10-11 (연서): the three strengths written for the job applications, in the site's 다체 */
      {
        claim: { ko: 'AI 툴 여러 개를 엮어 쓰되, 기획과 판단은 제가 합니다.', en: 'I combine many AI tools, but the planning and the judgment are mine.' },
        keyword: { ko: '기획과 판단', en: 'the planning and the judgment' },
        evidence: { ko: '웹디자인도 웹 코딩도 배운 적 없이 Manus, Claude, ChatGPT, Tripo로 지금 보고 있는 이 포트폴리오를 만들었다. 구조와 첫인상은 내가 기획했고, AI가 만든 결과는 직접 확인하며 고쳤다. AI 단편영화도 컨셉과 큰 줄거리는 내가 정하고 여섯 가지 AI 툴로 만들어, 서울대학교 중앙도서관에서 대상을 받았다. 지금은 툴을 쓰는 데서 나아가, 인공지능예술실습 수업에서 직접 짠 원단 사진으로 이미지 생성 모델을 학습시켜 영상과 이미지를 만들고 있다.', en: 'Having never studied web design or web coding, I built this portfolio with Manus, Claude, ChatGPT and Tripo. I planned the structure and the first impression myself, and checked and fixed what the AI made. For my AI short film I set the concept and the main story, made it with six AI tools, and won the grand prize at Seoul National University Library. Now I am going beyond using tools: in Deep Learning for Artists I train image generation models on photos of fabric I wove myself, and make video and images with them.' },
        media: 'images/projects/portfolio-site/thumb-card.jpg', /* the portfolio-site card image (연서, 2026-10-02) */
        link: 'portfolio-site',
      },
      {
        claim: { ko: '주어진 조건 안에서 방법을 찾고, 결과물까지 직접 만듭니다.', en: 'I find a way inside the constraints, and make the result myself.' },
        keyword: { ko: '결과물까지 직접', en: 'make the result myself' },
        evidence: { ko: '예술주간 야외 전시는 비 예보가 있어, 우산을 작품의 일부로 넣었다. 데님과 카프탄은 원단에 여유가 없어 봉제를 한 번밖에 할 수 없었다. 데님은 AI로 여러 디자인 시안을 먼저 만들어 방향을 정했고, 공모전에서 입선했다. 카프탄은 원단에 프린트하기 전에 완성한 디자인을 AI로 모델에게 입혀 봤고, 윌슨 컬리지 컬렉션 영구 소장작으로 선정됐다. Art2Wear는 다른 참가자와 주제가 겹쳐 \'불안과 집중의 공생\'으로 주제를 바꾸고, 직접 깨뜨린 도자기 접시로 꽃을 만들어 의상에 더했다.', en: 'With rain forecast for the outdoor Arts Week show, I worked an umbrella into the piece. For the denim and the kaftan there was no spare fabric, so each could be sewn only once. For the denim I made several design drafts with AI first and chose a direction, and it won an Honorable Mention. For the kaftan I used AI to see the finished design on a model before printing the fabric, and it was selected for the Wilson College Collection. At Art2Wear my theme overlapped with other entrants, so I changed it to the symbiosis of anxiety and focus, and made flowers from plates I broke myself to add to the garment.' },
        media: 'img/strength-2-art2wear-making.jpg', /* art2wear/30: making it by hand (연서, 2026-10-02) */
        link: 'art2wear',
      },
      {
        claim: { ko: '옷과 공간, 오브제를 3D로 옮깁니다.', en: 'I bring clothes, spaces and objects into 3D.' },
        keyword: { ko: '3D로 옮깁니다', en: 'into 3D' },
        evidence: { ko: '옷은 CLO 3D로 디자인해 국제 디지털 패션 공모전에서 입선했다. 공간은 Unreal Engine에서 에셋을 배치해 의류학과 실습실을 만들고, 짧은 영상으로 완성했다. 미래엔수학 캐릭터와 이 사이트의 도자기 꽃 오브제는 AI를 써서 3D 모델로 만들었다. 지금은 3D그래픽디자인 수업에서 Tripo와 Blender로 3D 포스터를 작업하고 있다.', en: 'Clothes I designed in CLO 3D won an Honorable Mention at the International Digital Fashion Contest. For space, I placed assets in Unreal Engine to build the clothing lab and finished it as a short film. The MiraeN Math character and the ceramic flower object on this site were made into 3D models with AI. Now I am working on a 3D poster with Tripo and Blender in 3D Graphic Design.' },
        media: 'images/projects/clo3d/ad06-card.jpg', /* the CLO 3D card image (2026-10-11) */
        link: 'clo3d',
      },
    ],

    /* EXPERIENCE above AWARDS (연서, 2026-10-09): the three internships and MiraeN, as the timeline has them */
    experience: [
      { year: '2026.05~08', label: { ko: '연구소 인턴', en: 'Research Intern' }, title: { ko: 'The Nonwovens Institute, NC State', en: 'The Nonwovens Institute, NC State' }, link: null },
      { year: '2026.01', label: { ko: '쇼룸 인턴 (마이애미)', en: 'Showroom Intern (Miami)' }, title: { ko: 'BRIDGE SHOWROOM', en: 'BRIDGE SHOWROOM' }, link: null },
      { year: '2025.11~2026.05', label: { ko: '마케팅 & 디자인 인턴 (원격, 미국)', en: 'Marketing & Design Intern (remote, US)' }, title: { ko: 'Missions with Monty', en: 'Missions with Monty' }, link: null },
      { year: '2025.01~08', label: { ko: '디자이너 & 마케터', en: 'Designer & Marketer' }, title: { ko: '미래엔수학 지사 (5개 구)', en: 'MiraeN Math (5-district branch)' }, link: 'miraen' },
    ],
    /* ACTIVITIES under WORK EXPERIENCE (연서, 2026-10-10): clubs and student groups, newest first, as the timeline has them.
       senior-fit is left out: it was a class project, not an activity */
    activities: [
      { year: '2024.07~2025.06', label: { ko: '기술팀 모션그래픽 디자이너', en: 'Motion Graphics, Technical Team' }, title: { ko: 'SUB 서울대학교 학생방송국', en: 'SUB, SNU Student Broadcasting' }, link: 'sub-motion' },
      { year: '2024.03~10', label: { ko: '디자이너 · 홍보팀', en: 'Designer & Promotions' }, title: { ko: '2024 의류학과 졸업패션쇼 〈형(形)〉', en: '2024 SNU Graduation Fashion Show ‘Form’' }, link: 'fashion-show-2024' },
      { year: '2023.07~2024.06', label: { ko: '디자인팀 · 공연팀', en: 'Design & Performance' }, title: { ko: 'SNUFESTIVAL 축제기획단', en: 'SNUFESTIVAL Committee' }, link: 'campus-festival' },
      { year: '2023.06~2024.03', label: { ko: '예능팀 기획 · 드라마팀 조연출', en: 'Variety planning & Drama AD' }, title: { ko: 'Imageband 영상제작 동아리', en: 'Imageband Film Club' }, link: null },
      { year: '2023.02~2024.02', label: { ko: '드럼', en: 'Drums' }, title: { ko: "밴드 '단풍' · '용감한 쿠키'", en: 'Bands ‘Danpung’ & ‘Brave Cookie’' }, link: null },
    ],
    /* AWARDS under KEY FIGURES (연서, 2026-10-09: these four; the APEC video's award is left out on purpose) */
    awards: [
      { year: '2026', label: { ko: '입선', en: 'Honorable Mention' }, title: { ko: 'D&J 코리아 데님 디자인 공모전', en: 'D&J Korea Denim Design Challenge' }, link: 'denim-2026' },
      { year: '2026', label: { ko: '영구 소장작 선정', en: 'Permanent collection' }, title: { ko: 'NC State 윌슨 컬리지 컬렉션 (카프탄)', en: 'Wilson College Collection, NC State (kaftan)' }, link: 'kaftan' },
      { year: '2025', label: { ko: '대상', en: 'Grand Prize' }, title: { ko: '서울대학교 중앙도서관 주관 〈AI로 만든 융합 영화상영회〉', en: 'AI Convergence Film Screening, Seoul National University Library' }, link: 'ai-short-film' },
      { year: '2024', label: { ko: '입선', en: 'Honorable Mention' }, title: { ko: '제13회 국제 디지털 패션 공모전 (한국의류산업학회)', en: '13th International Digital Fashion Contest (Korean Society for Clothing Industry)' }, link: 'clo3d' },
    ],
    stats: [
      { v: '3.9 / 4.3', l: 'GPA · Seoul National University' },
      { v: '4.0 / 4.0', l: 'GPA · NC State University (Exchange)' },
      { v: '4', l: 'AWARDS' },
    ],

    skills: [
      { group: { ko: '콘텐츠 · 마케팅', en: 'Content & Marketing' }, items: [{ ko: '숏폼 기획', en: 'Short-form planning' }, { ko: '채널 운영과 유료광고', en: 'Channel ops & paid media' }, { ko: '캐릭터를 활용한 콘텐츠', en: 'Character-based content' }] },
      { group: { ko: 'AI 툴', en: 'AI Tools' }, items: ['Midjourney', 'Kling AI', 'Higgsfield', 'Suno', 'Riffusion', 'ElevenLabs', 'Tripo', 'Manus', 'Claude Code'] }, /* Higgsfield added 2026-10-10 (연서: using it this weekend; deploy after she has) */
      { group: { ko: '패션 · 텍스타일', en: 'Fashion & Textile' }, items: ['CLO 3D', 'NedGraphics', { ko: '엔지니어드 프린트', en: 'Engineered print' }, { ko: '텍스타일 제작(프린트, 직조, 니트)', en: 'Textile making (print, weave, knit)' }, { ko: '패턴과 봉제', en: 'Pattern & construction' }] },
      { group: { ko: '디자인 · 영상', en: 'Design & Video' }, items: ['Photoshop', 'Illustrator', 'Procreate', 'After Effects', 'Premiere Pro', 'CapCut'] } /* Procreate added 2026-10-09 (연서) */, /* video tools moved here from Content (연서, 2026-10-05): tools with tools, the content group keeps what she plans and runs */
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
          desc: { ko: '', en: '' } /* title only (연서, 2026-10-04) */ },
      ],
    },
    {
      segment: '2023-1', grade: { ko: '2학년 1학기', en: 'Year 2-1' },
      items: [
        { date: '2023.02', until: '2024.02', major: false, link: null,
          title: { ko: '밴드 \'단풍\' · \'용감한 쿠키\': 드럼', en: 'Bands \'Danpung\' & \'Brave Cookie\': Drums' },
          desc: { ko: '두 밴드에서 드럼을 맡아 다섯 번 무대에 올랐다. 한 번은 2000년대 드라마 OST 메들리로 무대 전체를 구성했다. 곡 사이에 드라마 대사를 넣고 다 같이 교복을 입어, 단순한 연주가 아니라 하나의 콘셉트로 보이게 만들었다. 2023.02~2024.02', en: 'Five stages across two bands. For one I built the whole set as a 2000s drama-OST medley (dialogue between songs, the band in school uniforms) so it read as one concept, not just a set of songs. Feb 2023 to Feb 2024' } },
        { date: '2023.06', until: '2024.03', major: false, link: null,
          title: { ko: 'Imageband 영상제작 동아리: 예능팀 기획 · 드라마팀 조연출', en: 'Imageband Film Club: Variety planning & Drama AD' },
          desc: { ko: '예능팀에서 서바이벌 두뇌게임 쇼 콘셉트를 개발하고 게임 시뮬레이션·세트 디자인·초벌 편집에 참여. 드라마팀에서는 조연출로 배우 오디션과 현장 촬영을 지원. 2023.06~2024.03', en: 'Developed a survival brain-game show concept and worked on game simulation, set design and first-pass editing. As AD on the drama team, supported actor auditions and shoots. Jun 2023 to Mar 2024' } },
      ],
    },
    {
      segment: '2023-2', grade: { ko: '2학년 2학기', en: 'Year 2-2' },
      items: [
        { date: '2023.07', until: '2024.06', major: true, link: 'campus-festival',
          title: { ko: 'SNUFESTIVAL 축제기획단: 디자인팀 · 공연팀', en: 'SNUFESTIVAL Committee: Design & Performance' },
          desc: { ko: '디자인팀(6인) 팀원으로 공식 캐릭터 RIO의 굿즈를 디자인했고, 에어팟·버즈 케이스는 매진. 공연팀(6인)에서는 버스킹·폐막식 진행과 출연자 리허설 조율. 2023.07~2024.06', en: 'In the design team (6), designed RIO merchandise; the AirPods and Buds cases sold out. In the performance team (6) ran busking and the closing ceremony. Jul 2023 to Jun 2024' } },
      ],
    },
    {
      segment: '2024-1', grade: { ko: '3학년 1학기', en: 'Year 3-1' },
      items: [
        { date: '2024.03', until: '2024.10', major: true, link: 'fashion-show-2024',
          title: { ko: '2024 의류학과 졸업패션쇼 〈형(形)〉: 디자이너 · 홍보팀', en: '2024 SNU Graduation Fashion Show \'Form\': Designer & Promotions' },
          desc: { ko: '의류학과 졸업패션쇼에 디자이너로 참여해 룩 3벌을 제작하고, 홍보팀으로 인스타그램 관리·피드·숏폼 제작·디자이너 인터뷰를 맡음. 2024.03~10', en: 'Made three looks as a designer for the department graduation show, and on the promotion team ran Instagram, feed posts, short-form video and designer interviews. Mar to Oct 2024' } },
      ],
    },
    {
      segment: '2024-2', grade: { ko: '3학년 2학기', en: 'Year 3-2' },
      items: [
        { date: '2024.07', until: '2025.06', major: true, link: 'sub-motion',
          title: { ko: 'SUB 서울대학교 학생방송국: 기술팀 모션그래픽 디자이너', en: 'SUB, SNU Student Broadcasting: Motion Graphics, Technical Team' },
          desc: { ko: 'After Effects로 로제 \'Toxic Till the End\' 뮤직비디오 티저를 3인이 나눠 만들고, 그중 중간 파트의 모션그래픽을 맡음. 2024.07~2025.06', en: 'Made the motion graphics for Rosé\'s \'Toxic Till the End\' music video teaser in After Effects with two others, splitting it in three; I made the middle part. Jul 2024 to Jun 2025' } },
        { date: '2024.09', until: '2024.12', major: true, link: 'senior-fit',
          title: { ko: '관악노인종합복지관 × 서울대 협업 패션쇼: 시니어핏', en: 'Gwanak Senior Welfare Center × SNU Fashion Show: Senior Fit' },
          desc: { ko: '어르신 한 분을 전담해 수업에서 정해진 횟수보다 더 자주 만나 인터뷰하고, 취향과 신체적 특징을 그대로 설계 기준으로 삼아 코트를 제작. 어르신은 그 코트를 입고 시니어 런웨이에 오르셨다. 대학신문 인터뷰 대상자로 선정. 2024.09~12', en: 'Paired one-to-one with a senior model, interviewed him more often than the class required and built a coat from his taste and body. Shown on the senior runway; interviewed by The SNU Newspaper. Sep to Dec 2024' } },
        { date: '2024.11', major: true, link: 'clo3d',
          title: { ko: '입선: 제13회 국제 디지털 패션 공모전', en: 'Honorable Mention: 13th International Digital Fashion Contest' },
          desc: { ko: '한국의류산업학회 주최, 공모전 주제는 \'Dopamine Dressing\'. 러닝 크루 문화를 즐기는 20대 후반 직장인 페르소나를 정하고, WGSN 트렌드 리포트를 디자인 방향에 반영해 CLO 3D로 디자인부터 3D 시뮬레이션까지 단독 제작한 액티브웨어 컬렉션으로 입선. 2024.09~11', en: 'Hosted by the Korean Society for Clothing Industry, on the theme \'Dopamine Dressing\'. An activewear collection for a late-20s running-crew persona, with WGSN trend reports feeding the design direction, designed and simulated solo in CLO 3D. Sep to Nov 2024' } },
      ],
    },
    {
      segment: '2025-1', grade: { ko: '휴학', en: 'Leave of absence' },
      items: [
        { date: '2025.01', until: '2025.08', major: true, link: 'miraen',
          title: { ko: '미래엔수학 지사 (5개 구): 디자이너 & 마케터', en: 'MiraeN Math (5-district branch): Designer & Marketer' },
          desc: { ko: '지사장 한 명이 새로 연 지사의 SNS 3개 채널을 0에서 개설·운영. 팔로워 0인 계정에서 릴스 최고 조회수 2.9만. 브랜드 콘텐츠 50여 편, 2D 캐릭터를 AI로 3D화한 숏폼, 유료광고와 네이버 스마트플레이스 SEO 병행. 2025.01~08', en: 'Opened and ran three channels from zero for a branch one director had just opened. Top Reel 29,000 views from a zero-follower account. 50+ pieces of brand content, the 2D character turned into 3D with AI for short-form, paid media alongside Naver SmartPlace SEO. Jan to Aug 2025' } },
        { date: '2025.07', major: true, link: 'ai-short-film',
          title: { ko: '대상: 서울대학교 중앙도서관 주관 〈AI로 만든 융합 영화상영회〉', en: 'Grand Prize: Seoul National University Library ‘AI Convergence Film Screening’' },
          desc: { ko: '디지털 리터러시 아카데미 〈AI로 만드는 영화클래스〉(2025.06) 수료 후, 단편영화 \'Happiness is Intelligence?\'를 기획·연출·프롬프트 디렉팅·편집까지 단독 제작. 2025.07.10', en: 'After completing the Digital Literacy Academy ‘AI Filmmaking Class’ (Jun 2025), made the short film \'Happiness is Intelligence?\' solo: concept, direction, prompt direction and editing. 10 Jul 2025' } },
      ],
    },
    {
      segment: '2025-2', grade: { ko: '4학년 1학기 · 교환', en: 'Year 4-1 · Exchange' },
      items: [
        { date: '2025.08', until: '2026.06', major: true, link: null,
          title: { ko: 'NC State University, Wilson College of Textiles: 교환학생', en: 'NC State University, Wilson College of Textiles: Exchange' },
          desc: { ko: '패션 & 텍스타일 디자인. 두 학기 24학점 전 과목 A, GPA 4.0/4.0. 학기 중 현지 인턴과 캠퍼스 식당 근무를 병행. 2025.08.18~2026.06.30', en: 'Fashion & Textile Design. Straight A’s across 24 credits over two semesters, GPA 4.0/4.0, while interning and working on campus. 18 Aug 2025 to 30 Jun 2026' } },
        { date: '2025.11', until: '2026.05', major: false, link: null,
          title: { ko: 'Missions with Monty: 마케팅 & 디자인 인턴 (원격, 미국)', en: 'Missions with Monty: Marketing & Design Intern (remote, US)' },
          desc: { ko: '자기주도학습 게임 기반 프로젝트에서 소셜미디어 콘텐츠 기획과 굿즈 제작을 맡아, 연구 인사이트를 플랫폼에 맞는 콘텐츠로 옮겨 링크드인에 직접 게시. 교수진·디자인팀과 전 과정 영어로 협업. 2025.11~2026.05', en: 'Planned social content and merchandise for a game-based self-directed learning project, turning research insight into platform-native posts published on LinkedIn. Collaborated with faculty and the design team in English. Nov 2025 to May 2026' } },
      ],
    },
    {
      segment: '2026-1', grade: { ko: '4학년 2학기 · 교환', en: 'Year 4-2 · Exchange' },
      items: [
        { date: '2026.01', major: false, link: null,
          title: { ko: 'BRIDGE SHOWROOM: 쇼룸 인턴 (마이애미)', en: 'BRIDGE SHOWROOM: Showroom Intern (Miami)' },
          desc: { ko: '미국 하이엔드 패션 트레이드쇼에서 3일간 부스 운영과 상품 준비를 담당하고 현지 바이어·방문객을 영어로 응대. 완성된 제품과 비주얼이 바이어에게 어떻게 보이는지 현장에서 관찰. 2026.01.29~31', en: 'Three days running a booth at a US high-end fashion trade show, preparing product and handling buyers in English. Saw first-hand how finished product and visuals look to buyers. 29 to 31 Jan 2026' } },
        { date: '2026.01', until: '2026.04', major: true, link: 'art2wear',
          title: { ko: 'Art2Wear 2026 \'Tensed Symbiosis\': 웨어러블 아트 디자이너 & 런웨이 모델', en: 'Art2Wear 2026 \'Tensed Symbiosis\': Wearable Art Designer & Runway Model' },
          desc: { ko: '미국 교환 중 만든 작품. 접시를 직접 깨뜨려 꽃을 만들고 나뭇가지·청키한 실·인조진주·철사를 대비시킨 웨어러블 아트. NC State의 Gregg Museum of Art & Design 런웨이에 직접 입고 올랐다. 2026.01~04', en: 'Made during my exchange in the US: wearable art built from hand-broken ceramic flowers set against branches, chunky yarn, faux pearls and wire, worn on the runway at NC State’s Gregg Museum of Art & Design. Jan to Apr 2026' } },
        { date: '2026.01', until: '2026.04', major: true, link: 'kaftan',
          title: { ko: 'Engineered Kaftan: Wilson College Collection 영구 소장', en: 'Engineered Kaftan: Wilson College Collection (permanent)' },
          desc: { ko: '쇼팽 녹턴에서 출발한 엔지니어드 프린트 실크 카프탄. 패턴 3개와 레이아웃 3개로 배치를 실험해, 프린트가 옷 전체에서 하나의 구성으로 읽히도록 설계. 교수 추천으로 수업 대표로 출품돼 NC State Wilson College of Textiles Collection 영구 소장작으로 선정. 2026.01~04', en: 'An engineered-print silk kaftan that began with Chopin\'s Nocturnes. Three patterns and three layouts were tested in different placements so the print reads as one composition across the garment. Entered as the class representative on faculty recommendation and selected for permanent inclusion in the NC State Wilson College of Textiles Collection. Jan to Apr 2026' } },
        { date: '2026.05', until: '2026.08', major: true, link: null,
          title: { ko: 'The Nonwovens Institute, NC State: 연구소 인턴', en: 'The Nonwovens Institute, NC State: Research Intern' },
          desc: { ko: '언더아머(Under Armour)와 협력한 스판덱스 원사 샘플 테스트를 담당해 인장시험기로 신축성을 측정하고 무게도 재서 영어로 결과 보고. 크리스마스트리 농가용 부직포 보호 커버의 재단 패턴을 설계하고 열접합으로 샘플 제작. 2026.05.11~08.04', en: 'Ran spandex yarn tests for a project with Under Armour (stretch on a tensile tester, plus weight), reported in English. Designed the cutting pattern for nonwoven tree-farm covers and produced heat-bonded samples. 11 May to 4 Aug 2026' } },
      ],
    },
    {
      segment: '2026-2', grade: { ko: '5학년 1학기 · 마지막 학기', en: 'Year 5-1 · Final term' },
      items: [
        { date: '2026.09', major: false, link: '#now', /* jumps to NOW under the archive (연서, 2026-10-04) */
          title: { ko: '서울대 복귀: 졸업 전 마지막 학기', en: 'Back at SNU: final term before graduation' },
          desc: { ko: '교환 1년을 마치고 복귀. 이번 학기에 배우는 테크니컬 디자인, 인공지능예술실습, 3D 그래픽 디자인은 아래 NOW에.', en: 'Back from the exchange year. What I am learning this term (Technical Design, Deep Learning for Artists, 3D Graphic Design) is in NOW, further down.' } },
        { date: '2026.09', major: true, link: 'denim-2026',
          title: { ko: '입선: D&J 코리아 데님 디자인 공모전 2026 \'Squeezed Motion\'', en: 'Honorable Mention: D&J Korea Denim Design Challenge 2026, \'Squeezed Motion\'' },
          desc: { ko: '물감이 실이 되는 순간을 데님 위에 옮긴 작업. AI로 여러 시안을 먼저 비교한 뒤 민소매 상의와 생지 바지를 직접 만들고, 스판 데님을 칼·드릴·송곳으로 찢어 안쪽에 레이스를 댐. 본선을 거쳐 입선. 2026.09.23 발표', en: 'Paint becoming thread, on denim. Drafts compared with AI first, then a sleeveless top and raw denim trousers made by hand; the stretch denim torn with a knife, a drill and an awl and backed with lace. Finalist, then Honorable Mention. Announced 23 Sep 2026' } },
        { date: '2026.09', major: true, link: 'arts-week-2026',
          title: { ko: '2026 서울대 예술주간 〈공생 Tensed Symbiosis〉: 야외 설치', en: 'SNU Arts Week 2026 \'Tensed Symbiosis\': outdoor installation' },
          desc: { ko: 'Art2Wear 작품을 예술주간 야외 설치로 재구성. 대학 캠퍼스, 야외, 비 예보라는 장소와 조건을 읽고 우산을 더해, 대학생이 느끼는 압박으로 주제를 넓힘. 관정도서관 앞. 2026.09.28~10.02', en: 'The Art2Wear piece rebuilt as an outdoor installation for SNU Arts Week. Reading the site (a university campus, outdoors, rain in the forecast), I added an umbrella and turned it toward the pressure students carry. In front of Kwanjeong Library. 28 Sep to 2 Oct 2026' } },
      ],
    },
    {
      segment: '2027', grade: { ko: '졸업', en: 'Graduation' },
      items: [
        { date: '2027.02', major: true, link: null,
          title: { ko: '졸업 예정: 서울대학교 의류학과', en: 'Graduation (expected): SNU Clothing & Textiles' },
          desc: { ko: '학사 졸업 예정. 현재 기준 학점 3.9 / 4.3.', en: 'BA expected. GPA to date 3.9 / 4.3.' } },
      ],
    },
  ],

  /* ---- UI labels (English only) ---- */
  loader: { drag: 'DRAG TO OPEN', tap: 'TAP TO OPEN', objectLabel: '3D OBJECT' },
  name: { title: 'YEONSEO LEE', disciplines: 'FASHION · CONTENT · AI · INSIGHT', caption: '02 / NAME' },
  workUi: { imageSlot: 'IMAGE 3:4', objectLabel: '3D OBJECT', hint: 'SCROLL TO ROTATE · CLICK TO OPEN',
    /* under the ring: every featured project has a soundtrack on its page (연서, 2026-10-04) */
    soundNote: '♪ Every selected work comes with a song. Press play inside.' },
  aboutUi: {
    /* a small line under the three strengths so the underlined words are not missed (연서, 2026-10-02) */
    strengthHint: { ko: '밑줄 친 단어에 마우스를 올리면 사진이, 누르면 프로젝트가 열려요', en: 'hover the underlined words for a photo, click to open the project' },
    strengthHintTouch: { ko: '밑줄 친 단어를 누르면 사진이 열려요', en: 'tap the underlined words for a photo' },
    /* phones only: a small note once per visit that the full site is on a computer (연서, 2026-10-02) */
    desktopNote: { ko: '컴퓨터로 보면 훨씬 좋아요. 3D 링과 인터랙션까지 모두 보여요', en: 'Best viewed on a computer, with the 3D ring and every interaction' },
    desktopNoteClose: { ko: '닫기', en: 'Close' },
    strengths: 'STRENGTHS', profile: 'PROFILE', stats: 'KEY FIGURES', experience: 'WORK EXPERIENCE', activities: 'ACTIVITIES', awards: 'AWARDS', timeline: 'TIMELINE', segments: 'SEGMENTS', skills: 'SKILLS', openProject: 'OPEN PROJECT →', openNow: 'GO TO NOW ↓', photoSlot: 'IMAGE 3:4', mediaSlot: 'MEDIA 4:5' },
  archiveUi: {
    aiNowNote: { ko: '지금 배우고 있는 AI 작업은 NOW에 ↑', en: 'The AI work I am learning right now is in NOW ↑' }, /* shown only under AI WORKS (연서, 2026-10-09) */
    filterLabel: 'ARCHIVE FILTERS', imageSlot: 'IMAGE 3:4', inProgress: 'IN PROGRESS',
    filters: [
      /* AI WORKS right after ALL (연서, 2026-10-10: AI visual roles first) */
      { label: 'ALL', tag: null }, { label: 'AI WORKS', tag: 'AI' }, { label: 'FASHION', tag: 'FASHION' },
      { label: 'CONTENT', tag: 'CONTENT' }, { label: 'INSIGHT', tag: 'INSIGHT' },
    ],
    /* each filter can have its own order (연서, 2026-10-02); ALL and any slug left out follow featured, then archiveRank */
    order: { /* 2026-10-11 (연서: ALL is hers, the four filters left to Claude). FASHION follows ALL; AI keeps denim right after APEC;
                CONTENT puts the films she planned and directed first; INSIGHT follows strength 2 (audience first, then research) */
      FASHION: ['art2wear', 'denim-2026', 'fashion-show-2024', 'arts-week-2026', 'kaftan', 'adaptive-textile', 'clo3d', 'textile-woven', 'textile-printed', 'engineered-surfaces', 'textile-knit', 'senior-fit', 'fashion-illustration', 'korean-costume'],
      CONTENT: ['ai-short-film', 'promo-video-ai', 'directing-a-year', 'unreal-engine', 'sub-motion', 'portfolio-site', 'miraen', 'fashion-show-2024', 'campus-festival', 'seoul-metro'],
      AI: ['ai-short-film', 'portfolio-site', 'denim-2026', 'promo-video-ai', 'kaftan', 'miraen'], /* denim above the 2025 APEC film (2026-10-12, 연서 OK) */
      INSIGHT: ['miraen', 'senior-fit', 'adaptive-textile', 'directing-a-year', 'campus-festival'],
    },
  },
  /* NOW: what I am learning this term. Sits at the top of the archive section, above the filters (#now, moved 2026-10-09), same weight as the 3 strengths.
     Facts from 연서's class notes (Notion, weeks 1 to 5). The class show was cancelled by vote: do not mention it. */
  nowUi: { title: 'NOW', index: 'FALL 2026', lead: { ko: '졸업 전 마지막 학기에 배우는 것들과, 12월 종강까지 해낼 것.', en: 'What I am learning in my final term, and what I will have done by December.' }, next: { ko: '12월까지', en: 'By December' } },
  now: [
    {
      label: { ko: '인공지능예술실습 · 2026 가을학기', en: 'Deep Learning for Artists · Fall 2026' },
      claim: { ko: '이미지 AI의 작동 원리를 배우고, 그 과정 자체를 작업의 재료로 쓰는 법을 익히고 있습니다.', en: 'Learning how image AI works inside, and how to use that process itself as material for my work.' },
      evidence: { ko: '툴 사용법이 아니라 작동 원리를 배우고, 배운 원리는 그날 수업 안에 직접 실험으로 옮겨 영상과 이미지로 만든다. 미드저니로 만든 얼굴 이미지로 PyTorch에서 GAN을 처음부터 학습시켜 latent travel 영상을 만들었고, 클라우드 GPU를 빌려 사람 얼굴을 학습한 StyleGAN3를 내가 직접 짜고 촬영한 직조 원단 사진 23장으로 파인튜닝했다. 15분 남짓한 학습 동안 얼굴이 실의 결에 덮이며 원단이 되어 간다. 완성된 결과보다, 얼굴도 원단도 아닌 그 중간 상태의 이미지가 더 흥미로웠다.', en: 'The class teaches how image AI works rather than how to use the tools, and whatever we learn, I turn into an experiment in the same class and make it into video and images. I trained a GAN from scratch in PyTorch on face images I made in Midjourney and made a latent travel video. Then I rented a cloud GPU and fine-tuned StyleGAN3, pretrained on human faces, on 23 photos of fabric I wove and shot myself. Over about fifteen minutes of training, the faces are covered by the grain of the thread and turn into cloth. More interesting than the finished result was the state in between, neither face nor fabric.' },
      /* 연서's own run (week 4): every training image was made in Midjourney, so no real faces */
      media: [ /* 연서's order (2026-10-07): the two latent travel videos first (fabric, then face GAN), the StyleGAN3 grid last */
        { video: 'images/now/weave-travel.mp4', poster: 'images/now/weave-travel.jpg', caption: { ko: 'latent travel · 파인튜닝 중간 단계 모델', en: 'latent travel · a model midway through fine-tuning' } },
        { webm: 'images/now/latent-travel.webm', video: 'images/now/latent-travel.mp4', poster: 'images/now/latent-travel.jpg', caption: { ko: 'latent travel · 처음부터 직접 학습시킨 GAN', en: 'latent travel · a GAN I trained from scratch' } },
        { image: 'images/now/weave-3x3.jpg', caption: { ko: 'StyleGAN3 파인튜닝 · 학습 전 → 4kimg → 8kimg · 직접 짜고 촬영한 직조 원단 23장 · 사전학습 모델 NVIDIA StyleGAN3', en: 'StyleGAN3 fine-tuning · before training → 4kimg → 8kimg · 23 photos of fabric I wove and shot · pretrained model NVIDIA StyleGAN3' } },
      ],
      next: { ko: '내 데이터로 모델을 조정해 최종 프로젝트를 완성합니다.', en: 'Tune a model with my own data and finish the final project.' },
    },
    {
      label: { ko: '테크니컬 디자인 · 2026 가을학기', en: 'Technical Design · Fall 2026' },
      claim: { ko: '디자인을 공장이 읽을 수 있는 언어로 옮기는 법을 배우고 있습니다.', en: 'Learning to translate a design into the language a factory can read.' },
      evidence: { ko: '디자이너는 실루엣으로, 공장은 치수와 봉제 사양으로 말한다. 그 사이를 잇는 테크니컬 패키지(작업지시서)를 매주 과제로 쌓는 중.', en: 'A designer talks in silhouettes; a factory, in measurements and construction specs. Building the tech pack that connects the two, one weekly assignment at a time.' },
      next: { ko: '치수와 그레이딩, 원단, 부자재, 라벨, 샘플 평가까지 마치고 최종 발표. 범위가 겹치는 테크니컬디자이너 3급 응시도 검토 중입니다.', en: 'Measurements and grading, fabric, trims, labels and prototype evaluation, then the final presentation. Considering the Technical Designer Level 3 exam, which overlaps with the class.' },
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
  sound: { ambient: '', hint: { mouse: '♪ Click anywhere to turn on the sound', touch: '♪ Tap anywhere for sound' } },

  contactUi: { title: "LET'S TALK.", linkedin: 'LINKEDIN ↗', imageSlot: 'IMAGE 16:9', caption: '05 / 06', footerLeft: '© 2026 YEONSEO LEE' },
  detail: { resultTbc: 'RESULT: TO BE CONFIRMED' },
  detailUi: { heroSlot: 'IMAGE 16:9', gallerySlot: 'IMAGE', period: 'PERIOD', role: 'ROLE', need: 'NEED', action: 'ACTION', result: 'RESULT', gallery: 'GALLERY', process: { ko: '작업과정', en: 'PROCESS' }, film: 'FILM', watch: { ko: 'YouTube에서 보기 ↗', en: 'Watch on YouTube ↗' }, watchDrive: { ko: 'Google Drive에서 보기 ↗', en: 'Watch on Google Drive ↗' }, watchInstagram: { ko: 'Instagram에서 보기 ↗', en: 'Watch on Instagram ↗' }, fullSong: { ko: 'YouTube에서 전곡 ↗', en: 'Full song on YouTube ↗' }, press: 'PRESS', soundtrack: 'SOUNDTRACK', close: 'CLOSE', closeExpanded: 'CLOSE −' },
};
