// State Management
let listings = [];
let currentFilter = 'all';
let checkedChecklistItems = {}; // { listingId: { itemId: true/false } }

// Weights
const WEIGHTS = {
  a: 0.35, // 小区长期居住质量
  b: 0.30, // 户型与室内生活质量
  c: 0.15, // 租金、合同与性价比
  d: 0.10, // 地段与生活便利
  e: 0.10  // 风险与不确定性
};

// Default Listings Data (High Fidelity Mock)
const DEFAULT_LISTINGS = [
  {
    id: "lst-SH30928372",
    community: "上海绿城",
    unit_id: "3室 / 12/28层 / 128㎡",
    rent: 17800,
    area_sqm: 128,
    bedroom_count: 3,
    has_independent_study: true,
    floor: "12/28层",
    orientation: "南北",
    layout_comment: "标准的南北通透真三房，户型方正。北向次卧带有开阔的大飘窗，采光和通风条件优秀，可完美用作独立的 WFH 书房，工作环境静谧舒适。",
    renovation: "精装",
    noise_risk: "低噪音。位于小区腹地，无马路胎噪干扰",
    greenery: "绿化率高达 45%，有开阔的中央大草坪与散步水景区，植物高低错落极为成熟",
    car_pedestrian_separation: "完全人车分流，人行绿道完全无机动车占道现象，散步步行体验极佳",
    property_management: "绿城自持品质物业，安保极其负责，公区地面保洁频率极高，绿化维护好",
    community_atmosphere: "高档成熟自住社区，低密安静，邻里以高端白领及外籍家庭为主，整体低压稳定",
    daily_convenience: "距离地铁站步行6-8分钟，周边500米内有便利店、生鲜超市和两家独立精品咖啡馆",
    commute: "距离地铁4/6号线步行6-8分钟，打车及出行均极为方便",
    lease_terms: "付款押一付三，房东全力配合签署 3 年长约，承诺租期内绝不以任何理由涨租",
    landlord_risk: "低风险。房东为上海本地高净值人士，该房为纯资产配置，无自住与近期出售打算",
    viewing_notes: "现场实测日照极佳，次卧正南书房视野开阔，极度静谧，是长期在家办公的梦幻之选。唯一微小风险是主卧空调较旧，房东承诺签约后更换。",
    dim_a: 10,
    dim_b: 9,
    dim_c: 8,
    dim_d: 8,
    dim_e: 9,
    rl_not_three_bed: false,
    rl_car_messy: false,
    'rl_wfh-bad': false,
    rl_wfh_bad: false,
    rl_property_bad: false,
    rl_lease_unstable: false,
    is_offline: false
  },
  {
    id: "lst-SH30291823",
    community: "仁恒河滨城",
    unit_id: "3室 / 15/30层 / 138㎡",
    rent: 22500,
    area_sqm: 138,
    bedroom_count: 3,
    has_independent_study: true,
    floor: "15/30层",
    orientation: "南北",
    layout_comment: "正气三房，带有经典的仁恒地暖与恒温系统。北侧小书房配有大型工作台与嵌入式书柜，网络接口丰富，网络极其稳定，是长期 WFH 极佳的工作空间。",
    renovation: "经典精装",
    noise_risk: "低噪音，河道景观房，傍晚散步道有轻微声响",
    greenery: "联洋国际社区标杆，河滨散步道体验无可挑剔，绿化覆盖率极高，热带风情强",
    car_pedestrian_separation: "完全人车分流，小区人行系统与车道完全隔绝，内部步行安全感极高",
    property_management: "仁恒顶级物业服务，会所设施完备，公区保洁日均多次，保安素质极高",
    community_atmosphere: "典型高端国际化大社区，外籍住户多。但由于总户数多，早晚高峰公区有轻微拥挤感",
    daily_convenience: "紧邻洋泾港河滨道，步行5分钟至大拇指广场及联洋广场，周边日常散步及慢跑感极佳",
    commute: "距离地铁9号线步行约10分钟，通勤较便利",
    lease_terms: "月租金偏高。可签3年合同，但房东提出2年后若市场波动保留按5%以内涨幅调整的权利",
    landlord_risk: "中低风险。房东为江浙企业家，房产无抵押，但后续可能有资产配置套现诉求",
    viewing_notes: "河滨道散步体验极佳，物业公区完全无可挑剔，唯独溢价略高，性价比偏低。书房隔音极好。",
    dim_a: 9,
    dim_b: 9,
    dim_c: 7,
    dim_d: 9,
    dim_e: 8,
    rl_not_three_bed: false,
    rl_car_messy: false,
    'rl_wfh-bad': false,
    rl_wfh_bad: false,
    rl_property_bad: false,
    rl_lease_unstable: false,
    is_offline: false
  },
  {
    id: "lst-SH30391823",
    community: "香梅花园",
    unit_id: "3室 / 14/22层 / 132㎡",
    rent: 18500,
    area_sqm: 132,
    bedroom_count: 3,
    has_independent_study: true,
    floor: "14/22层",
    orientation: "南北",
    layout_comment: "正气南北通透三房，得房率极高。北面书房直面小区中心绿地，视野清静，采光温和舒适，没有视线遮挡与噪音干扰，长期 WFH 体验极佳。",
    renovation: "现代精装",
    noise_risk: "低噪音，实测远离杨高路干扰",
    greenery: "紧邻世纪公园，小区绿化成熟，水景假山环绕，绿意盎然，散步感极其高级",
    car_pedestrian_separation: "一期二期完全人车分流，地面完全无车辆干涉，步行安全性及安静度卓越",
    property_management: "高标准物业管理，安保负责，公区通道每日彻底清扫，绿化修剪精细",
    community_atmosphere: "典型花木高端中产社区，住户以科技新贵及高管自住为主，文化稳定低压",
    daily_convenience: "靠近地铁，周边多家中高档餐厅、便利店和世纪公园天然绿色走廊，散步首选",
    commute: "打车到陆家嘴约15分钟，地铁及自驾极其方便",
    lease_terms: "付款押一付三，支持3-5年稳定长约谈判，争取涨幅封顶条款",
    landlord_risk: "低风险。房东持有稳定，不急于变卖，极度配合长期合约商谈",
    viewing_notes: "现场实测环境极为宜人，靠近世纪公园。书房采光极度柔和，没有任何外部噪声。房东也很有商量余地。",
    dim_a: 9,
    dim_b: 9,
    dim_c: 8,
    dim_d: 9,
    dim_e: 8,
    rl_not_three_bed: false,
    rl_car_messy: false,
    'rl_wfh-bad': false,
    rl_wfh_bad: false,
    rl_property_bad: false,
    rl_lease_unstable: false,
    is_offline: false
  },
  {
    id: "lst-SH30400101",
    community: "陆家嘴中央公寓",
    unit_id: "3室 / 9/18层 / 128㎡",
    rent: 19500,
    area_sqm: 128,
    bedroom_count: 3,
    has_independent_study: true,
    floor: "9/18层",
    orientation: "南北",
    layout_comment: "花木板块标杆社区，两房朝南一房朝北。北向次卧书房加装了高级静音真空玻璃，面积达9.5㎡，摆放工作站及沙发床后仍很宽敞，居家办公专注感极强。",
    renovation: "意式高档精装",
    noise_risk: "极低噪音，避开了干道胎噪，环境绝对安宁",
    greenery: "高绿化中产社区，中庭设计开阔，草坪维护干净整洁，散步路径长",
    car_pedestrian_separation: "完全地下行车，人车彻底分流，地面没有任何尾气和引擎杂音干扰",
    property_management: "正规高水平物业管理，全天候安防巡逻，垃圾分类正规，公区干净",
    community_atmosphere: "安静的白领自住大区，少有频繁搬迁，人文气息浓，居住环境极其舒适",
    daily_convenience: "花木商业圈内，步行10分钟可达中高档生鲜超市和便利商店，基础配套完善",
    commute: "距世纪大道/陆家嘴通勤便利，打车路线顺畅",
    lease_terms: "押一付三，可签署2年以上租约",
    landlord_risk: "中低风险。房东主要为资产投资持有，出租信誉高，保修响应积极",
    viewing_notes: "小区设计极具现代感，人车分流做得非常彻底，地面上没有任何杂噪。房间内装修保养很好，地暖出热快，WFH极佳选择。",
    dim_a: 9,
    dim_b: 9,
    dim_c: 7,
    dim_d: 8,
    dim_e: 8,
    rl_not_three_bed: false,
    rl_car_messy: false,
    'rl_wfh-bad': false,
    rl_wfh_bad: false,
    rl_property_bad: false,
    rl_lease_unstable: false,
    is_offline: false
  },
  {
    id: "lst-SH30500101",
    community: "联洋年华",
    unit_id: "3室 / 12/16层 / 120㎡",
    rent: 17200,
    area_sqm: 120,
    bedroom_count: 3,
    has_independent_study: true,
    floor: "12/16层",
    orientation: "朝南",
    layout_comment: "成熟的联洋高绿化板块。真三房紧凑正气户型，书房面宽达3.2米，朝阳充足，视野无遮挡。小区公区散步体验温润安全，邻里质量极高。",
    renovation: "北欧风精装",
    noise_risk: "中低噪音。傍晚楼下内部环路偶尔有小孩子嬉闹，不影响书房办公",
    greenery: "联洋国际核心区，绿化成熟葱郁，小区带有小桥流水步行网，散步感极好",
    car_pedestrian_separation: "完全人车分流，人行绿道无任何机动车辆挤占，步行安全舒心",
    property_management: "联洋星级物业服务，公区清扫极佳，垃圾分类定时保洁，电梯安全维护高",
    community_atmosphere: "国际中产及外企白领自住区，邻居作息规律静谧，生活环境极其舒服",
    daily_convenience: "紧邻联洋生活大拇指辐射圈，步行500米即可满足日常生活、超市和咖啡馆办公",
    commute: "地铁9号线较为便利，打车方便",
    lease_terms: "月租性价比极佳。房东配合签署长期租约，条款常规",
    landlord_risk: "中低风险。房东通常持有稳定，愿意商谈3年长租，无大件自然折旧推诿风险",
    viewing_notes: "租金在联洋板块很有优势，小区内部绿化率很高，有小溪流穿过，很有居家感。书房面宽很宽，朝阳，工作体验好。",
    dim_a: 8,
    dim_b: 8,
    dim_c: 8,
    dim_d: 9,
    dim_e: 8,
    rl_not_three_bed: false,
    rl_car_messy: false,
    'rl_wfh-bad': false,
    rl_wfh_bad: false,
    rl_property_bad: false,
    rl_lease_unstable: false,
    is_offline: false
  },
  {
    id: "lst-SH30718291",
    community: "水清木华",
    unit_id: "2号楼低区户型",
    rent: 16800,
    area_sqm: 105,
    bedroom_count: 2,
    has_independent_study: false,
    floor: "3/18层",
    orientation: "东南",
    layout_comment: "伪三房。实际是两房改的三房。书房是在客厅一侧用轻钢龙骨石膏板隔出的小隔间，没有独立窗户，只有靠室内玻璃窗借光。空间极度压抑且不通风，完全不适合长期居家办公。",
    renovation: "中装，装修年代较久（10年以上），墙面有轻微开裂和受潮痕迹，家具陈旧",
    noise_risk: "高噪音，楼层低且靠近小区大门，外卖和行人噪音不绝于耳",
    greenery: "小区整体规模偏小，绿化带缺乏打理，毫无居住散步可言",
    car_pedestrian_separation: "人车不分流，小区地面上停满了车，人车混行严重，步行体验极度压抑紧张",
    property_management: "老牌物业，垃圾房管理混乱，公区通道经常堆放有住户杂物，电梯偶尔有异响",
    community_atmosphere: "社区人口密度高，老年人与合租白领较多，邻里关系较嘈杂",
    daily_convenience: "地段优越，紧邻世纪公园，外部生活配套和地铁通勤极其强悍",
    commute: "通勤无懈可击，但与居家品质冲突",
    lease_terms: "房东配合度一般，租约只能签 1 年，续签视市场情况再定，押二付一",
    landlord_risk: "高风险。房东明确表示该房挂牌在售，若有人看房需配合开门，并约定若售出需在30天内搬离",
    viewing_notes: "书房无窗直接闷死，完全无法用作WFH。另外，小区车停得密密麻麻，走路都要侧身。房东在售是巨大的不稳定炸弹，坚决一票否决淘汰。",
    dim_a: 5,
    dim_b: 4,
    dim_c: 5,
    dim_d: 8,
    dim_e: 3,
    rl_not_three_bed: true, // Triggers Red Line 1
    rl_car_messy: true,      // Triggers Red Line 2
    'rl_wfh-bad': true,        // Triggers Red Line 3
    rl_wfh_bad: true,
    rl_property_bad: false,
    rl_lease_unstable: true,  // Triggers Red Line 5
    is_offline: false
  },
  {
    id: "lst-SH30619281",
    community: "涵合园",
    unit_id: "低密复式下叠",
    rent: 19500,
    area_sqm: 150,
    bedroom_count: 3,
    has_independent_study: true,
    floor: "1-2层",
    orientation: "南北",
    layout_comment: "超大下叠，户型非常完美，二楼朝南配有独立阔绰书房，采光与空间感一流，带有地下储藏室，完美适合 WFH。",
    renovation: "高档意式极简精装，配有地暖与新风系统，家电均为高档品牌",
    noise_risk: "低噪音，得益于复式户型以及隔音材料，室内极其安静",
    greenery: "小区原本设计绿化佳，但由于后期绿化带缺乏修剪，部分区域杂草丛生，水景已干涸",
    car_pedestrian_separation: "设计上人车分流，但由于物业失职，小区路上停满了私家车，甚至堵塞了消防通道，步行安全感差",
    property_management: "物业管理差，公区绿化长期荒废，保洁拖延，保安多为年迈人员，无来访登记",
    community_atmosphere: "低密度别墅/洋房区，邻居多为高净值家庭。但由于物业不作为，邻里之间因草坪违停、私搭乱建常有摩擦",
    daily_convenience: "地段偏僻，周边商业配套较远，步行范围内无大型超市，生活采购较为不便",
    commute: "距离地铁较远，日常严重依赖打车或自驾出行",
    lease_terms: "可以签 3 年长约，承诺涨幅控制在 2% 以内，押一付三",
    landlord_risk: "低风险。房东为常驻国外的华人，诚心长租，不急于收回或出售",
    viewing_notes: "户型及室内高品质无可挑剔，几乎是WFH的梦想房源。然而，小区公区管理彻底坍塌，违停泛滥，物业形同虚设。触发人车混杂、物业极糟糕两条红线，痛心淘汰。",
    dim_a: 4,
    dim_b: 9,
    dim_c: 8,
    dim_d: 6,
    dim_e: 8,
    rl_not_three_bed: false,
    rl_car_messy: true,     // Triggers Red Line 2
    'rl_wfh-bad': false,
    rl_wfh_bad: false,
    rl_property_bad: true,  // Triggers Red Line 4
    rl_lease_unstable: false,
    is_offline: false
  }
];

// Helper: Calculate Score out of 100 based on weights
function calculateScore(listing) {
  const score = (
    listing.dim_a * WEIGHTS.a +
    listing.dim_b * WEIGHTS.b +
    listing.dim_c * WEIGHTS.c +
    listing.dim_d * WEIGHTS.d +
    listing.dim_e * WEIGHTS.e
  ) * 10;
  return Math.round(score * 10) / 10; // Round to 1 decimal place
}

// Helper: Determine Recommendation Grade (S, A, B, C, D)
function determineGrade(listing, score) {
  const isRedLineTriggered = 
    listing.rl_not_three_bed || 
    listing.rl_car_messy || 
    listing['rl_wfh-bad'] || 
    listing.rl_wfh_bad ||
    listing.rl_property_bad || 
    listing.rl_lease_unstable;
  
  if (isRedLineTriggered) {
    return 'D'; // Eliminated
  }
  
  if (score >= 85) {
    const isTier1 = listing.community.includes('绿城') || listing.community.includes('仁恒');
    return isTier1 ? 'S' : 'A';
  } else if (score >= 75) {
    return 'A';
  } else if (score >= 65) {
    return 'B';
  } else {
    return 'C';
  }
}

// Save & Load State
function saveState() {
  localStorage.setItem('sh_rental_map_listings', JSON.stringify(listings));
  localStorage.setItem('sh_rental_map_checklist', JSON.stringify(checkedChecklistItems));
  updateStats();
}

function loadState() {
  const storedListings = localStorage.getItem('sh_rental_map_listings');
  const storedChecklist = localStorage.getItem('sh_rental_map_checklist');
  
  if (storedListings) {
    listings = JSON.parse(storedListings);
  } else {
    listings = [...DEFAULT_LISTINGS];
    saveState();
  }
  
  if (storedChecklist) {
    checkedChecklistItems = JSON.parse(storedChecklist);
  } else {
    checkedChecklistItems = {};
  }

  // Live Sync Ingestion Loop from Scraper (CORS-safe window.scrapedListings)
  if (window.scrapedListings && Array.isArray(window.scrapedListings)) {
    console.log(`Live Scraper: Detected ${window.scrapedListings.length} synced listings.`);
    
    const indicator = document.getElementById('sync-indicator');
    if (indicator && window.scrapedListingsLastSync) {
      indicator.innerText = `🔄 同步时间: ${window.scrapedListingsLastSync}`;
      indicator.style.display = 'inline-block';
    }
    
    listings.forEach(l => {
      if (l.id.startsWith('lst-SH')) {
        l.is_offline = true; 
      }
    });

    window.scrapedListings.forEach(scraped => {
      const existingIndex = listings.findIndex(l => l.id === scraped.id);
      if (existingIndex >= 0) {
        listings[existingIndex].rent = scraped.rent;
        listings[existingIndex].unit_id = scraped.unit_id;
        listings[existingIndex].floor = scraped.floor;
        listings[existingIndex].orientation = scraped.orientation;
        listings[existingIndex].is_offline = false;
      } else {
        listings.push(scraped);
      }
    });
    
    saveState();
  }
}

// Update Header Stats
function updateStats() {
  const totalEl = document.getElementById('stat-total');
  const topEl = document.getElementById('stat-top');
  const eliminatedEl = document.getElementById('stat-eliminated');
  
  if (totalEl) totalEl.innerText = listings.length;
  
  let topScore = 0;
  let eliminatedCount = 0;
  
  listings.forEach(listing => {
    const score = calculateScore(listing);
    const grade = determineGrade(listing, score);
    
    if (grade === 'D') {
      eliminatedCount++;
    } else {
      if (score > topScore) topScore = score;
    }
  });
  
  if (topEl) topEl.innerText = topScore > 0 ? topScore : '-';
  if (eliminatedEl) eliminatedEl.innerText = eliminatedCount;
}

// Renders the Dashboard listings
function renderDashboard() {
  const container = document.getElementById('listings-render-container');
  if (!container) return;
  container.innerHTML = '';
  
  const budgetInput = document.getElementById('budget-filter-input');
  const maxBudget = budgetInput ? parseInt(budgetInput.value) : NaN;
  
  const filteredListings = listings.filter(listing => {
    const score = calculateScore(listing);
    const grade = determineGrade(listing, score);
    
    let matchesTier = true;
    if (currentFilter === 'all') matchesTier = true;
    else if (currentFilter === 'S-A') matchesTier = (grade === 'S' || grade === 'A');
    else if (currentFilter === 'B') matchesTier = (grade === 'B');
    else if (currentFilter === 'D') matchesTier = (grade === 'D');
    
    const matchesBudget = isNaN(maxBudget) || listing.rent <= maxBudget;
    
    return matchesTier && matchesBudget;
  });
  
  filteredListings.sort((a, b) => {
    const scoreA = calculateScore(a);
    const scoreB = calculateScore(b);
    const gradeA = determineGrade(a, scoreA);
    const gradeB = determineGrade(b, scoreB);
    
    if (gradeA === 'D' && gradeB !== 'D') return 1;
    if (gradeA !== 'D' && gradeB === 'D') return -1;
    return scoreB - scoreA;
  });
  
  if (filteredListings.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div style="font-size: 48px;">🔍</div>
        <p style="margin-top: 10px;">没有找到符合当前过滤条件的房源数据</p>
      </div>
    `;
    return;
  }
  
  filteredListings.forEach((listing, index) => {
    const score = calculateScore(listing);
    const grade = determineGrade(listing, score);
    const globalIndex = listings.findIndex(l => l.id === listing.id);
    
    const card = document.createElement('div');
    card.className = `card property-card ${grade === 'D' ? 'eliminated' : ''} ${grade === 'S' ? 'highly-recommended' : ''} ${listing.is_offline ? 'offline' : ''}`;
    
    let redLinesHtml = '';
    const hasRl1 = listing.rl_not_three_bed;
    const hasRl2 = listing.rl_car_messy;
    const hasRl3 = listing['rl_wfh-bad'] || listing.rl_wfh_bad;
    const hasRl4 = listing.rl_property_bad;
    const hasRl5 = listing.rl_lease_unstable;
    
    if (grade === 'D') {
      redLinesHtml = `
        <div class="red-flags-alert">
          <strong>🚫 触发红线被淘汰：</strong>
          ${hasRl1 ? '• 房间不足三房，或无独立书房空间 ' : ''}
          ${hasRl2 ? '• 小区人车混杂停满私家车，无步行绿化带 ' : ''}
          ${hasRl3 ? '• 居家书房极度压抑、光线差或噪音过大 ' : ''}
          ${hasRl4 ? '• 物业严重失职，垃圾堆积、治安及公区极差 ' : ''}
          ${hasRl5 ? '• 房东随时要变卖或拒绝签署长期租约 ' : ''}
        </div>
      `;
    }
    
    const offlineBadge = listing.is_offline ? '<span class="badge-offline">已下架</span>' : '';
    
    let lianjiaUrl = listing.detail_url;
    if (!lianjiaUrl || !lianjiaUrl.startsWith('http')) {
      if (listing.id.startsWith('lst-SH')) {
        const lianjiaId = listing.id.replace('lst-', '');
        lianjiaUrl = `https://sh.lianjia.com/zufang/${lianjiaId}.html`;
      } else {
        lianjiaUrl = `https://sh.lianjia.com/zufang/rs${encodeURIComponent(listing.community)}/`;
      }
    }
    
    card.innerHTML = `
      <div class="property-header">
        <div class="property-title">
          <h3>${escapeHtml(listing.community)}${offlineBadge}</h3>
          <p>${escapeHtml(listing.unit_id)}</p>
        </div>
        <div class="badge-grade grade-${grade}">${grade}</div>
      </div>
      
      <div class="property-rent">
        ${listing.rent} <span>元/月 (${listing.area_sqm}㎡)</span>
      </div>
      
      <div class="property-details">
        <div class="detail-item">🛏️ <strong>房间:</strong> ${listing.bedroom_count}房</div>
        <div class="detail-item">🏢 <strong>楼层:</strong> ${escapeHtml(listing.floor)}</div>
        <div class="detail-item">🧭 <strong>朝向:</strong> ${escapeHtml(listing.orientation)}</div>
        <div class="detail-item">🎨 <strong>装修:</strong> ${escapeHtml(listing.renovation)}</div>
      </div>
      
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
        <strong>户内评价：</strong>${escapeHtml(listing.layout_comment || '无')}
      </p>

      <div class="score-breakdown">
        <div class="score-bar-container">
          <span>量化综合得分</span>
          <span style="font-weight: 700; color: ${grade === 'D' ? 'var(--accent-danger)' : 'var(--accent-success)'};">${score} / 100</span>
        </div>
        <div class="score-track">
          <div class="score-bar" style="width: ${score}%; background: ${grade === 'D' ? 'var(--accent-danger)' : 'var(--gradient-brand)'};"></div>
        </div>
      </div>
      
      ${redLinesHtml}
      
      <div class="property-actions">
        <a href="${lianjiaUrl}" target="_blank" class="btn btn-secondary btn-icon" style="color: var(--accent-primary); border-color: rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.05); text-decoration: none;" title="跳转到链家页面">🔗 链家直达</a>
        <button class="btn btn-secondary btn-icon" onclick="editListing(${globalIndex})" title="评测打分">✏️ 评测打分</button>
        <button class="btn btn-danger btn-icon" style="margin-left: auto;" onclick="deleteListing(${globalIndex})" title="删除房源">🗑️ 删除</button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Side-by-side Comparison Matrix
function renderCompareMatrix() {
  const table = document.getElementById('compare-table-el');
  if (!table) return;
  table.innerHTML = '';
  
  const activeListings = listings.filter(l => true).sort((a, b) => {
    const scoreA = calculateScore(a);
    const scoreB = calculateScore(b);
    const gradeA = determineGrade(a, scoreA);
    const gradeB = determineGrade(b, scoreB);
    
    if (gradeA === 'D' && gradeB !== 'D') return 1;
    if (gradeA !== 'D' && gradeB === 'D') return -1;
    return scoreB - scoreA;
  });
  
  if (activeListings.length === 0) {
    table.innerHTML = `<tr><td style="text-align: center; padding: 40px; color: var(--text-muted);">暂无房源数据。</td></tr>`;
    return;
  }
  
  const rows = [
    { label: '房源小区', key: 'community' },
    { label: '房源标识', key: 'unit_id' },
    { label: '租房链接', key: 'id', format: (val, l) => {
      let url = l.detail_url;
      if (!url || !url.startsWith('http')) {
        if (l.id.startsWith('lst-SH')) {
          url = `https://sh.lianjia.com/zufang/${l.id.replace('lst-', '')}.html`;
        } else {
          url = `https://sh.lianjia.com/zufang/rs${encodeURIComponent(l.community)}/`;
        }
      }
      return `<a href="${url}" target="_blank" style="color: var(--accent-primary); text-decoration: underline; font-weight: 500;">🔗 链家直达</a>`;
    } },
    { label: '决策评级', key: 'grade' },
    { label: '综合评分', key: 'score' },
    { label: '月租金', key: 'rent', format: val => `${val} 元/月` },
    { label: '套内/建面', key: 'area_sqm', format: val => `${val} ㎡` },
    { label: '房间数', key: 'bedroom_count', format: val => `${val} 房` },
    { label: '独立书房', key: 'has_independent_study', format: val => val ? '✅ 有' : '❌ 无' },
    { label: '楼层朝向', key: 'floor_orient', format: (v, l) => `${l.floor} / ${l.orientation}` },
    { label: '室内装修', key: 'renovation' },
    { label: '户型评价', key: 'layout_comment' },
    
    { label: 'A. 小区长期居住 (35%)', key: 'dim_a', isScore: true },
    { label: 'B. 户型与WFH质量 (30%)', key: 'dim_b', isScore: true },
    { label: 'C. 租金性价比 (15%)', key: 'dim_c', isScore: true },
    { label: 'D. 地段生活便利 (10%)', key: 'dim_d', isScore: true },
    { label: 'E. 风险与不确定 (10%)', key: 'dim_e', isScore: true },
    
    { label: '小区绿化与散步感', key: 'greenery' },
    { label: '小区人车分流', key: 'car_pedestrian_separation' },
    { label: '物业管理与安全', key: 'property_management' },
    { label: '社区氛围与邻里', key: 'community_atmosphere' },
    { label: '生活商业便利性', key: 'daily_convenience' },
    { label: '地段与通勤评价', key: 'commute' },
    { label: '合同条款与长租稳定性', key: 'lease_terms' },
    { label: '房东套现/自住风险', key: 'landlord_risk' },
    { label: '看房实地备注', key: 'viewing_notes' }
  ];
  
  let headerHtml = '<tr><th style="min-width: 180px; position: sticky; left: 0; background: var(--bg-secondary); z-index: 1;">核心比较维度</th>';
  activeListings.forEach(l => {
    const score = calculateScore(l);
    const grade = determineGrade(l, score);
    headerHtml += `<th style="min-width: 250px; text-align: center; background: ${grade === 'D' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(59, 130, 246, 0.05)'};">
      <div style="font-weight: 700; font-size: 16px;">${escapeHtml(l.community)}</div>
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${escapeHtml(l.unit_id)}</div>
    </th>`;
  });
  headerHtml += '</tr>';
  table.innerHTML += headerHtml;
  
  rows.forEach(r => {
    let rowHtml = `<tr><td class="dim-header" style="position: sticky; left: 0; background: var(--bg-secondary); z-index: 1;">${r.label}</td>`;
    
    activeListings.forEach(l => {
      const score = calculateScore(l);
      const grade = determineGrade(l, score);
      
      let val = '';
      if (r.key === 'grade') {
        val = `<span class="badge-grade grade-${grade}" style="width: 28px; height: 28px; font-size: 13px; display: inline-flex; margin: 0 auto;">${grade}</span>`;
      } else if (r.key === 'score') {
        val = `<strong style="font-size: 16px; color: ${grade === 'D' ? 'var(--accent-danger)' : 'var(--accent-success)'};">${score}</strong> / 100`;
      } else if (r.isScore) {
        const rating = l[r.key];
        val = `<span style="font-weight: 600; color: var(--accent-primary);">${rating}</span>/10`;
      } else if (r.format) {
        val = r.format(l[r.key], l);
      } else {
        val = l[r.key] || '-';
      }
      
      let cellStyle = '';
      if (grade === 'D') {
        cellStyle = 'background: rgba(239, 68, 68, 0.01); color: var(--text-secondary);';
      }
      
      rowHtml += `<td style="text-align: ${r.key === 'grade' || r.key === 'score' || r.isScore ? 'center' : 'left'}; ${cellStyle}">${val}</td>`;
    });
    
    rowHtml += '</tr>';
    table.innerHTML += rowHtml;
  });
}

// Generate Decision Report (Markdown)
function renderReport() {
  const container = document.getElementById('report-md-content');
  if (!container) return;
  
  const sortedListings = [...listings].sort((a, b) => {
    const scoreA = calculateScore(a);
    const scoreB = calculateScore(b);
    const gradeA = determineGrade(a, scoreA);
    const gradeB = determineGrade(b, scoreB);
    
    if (gradeA === 'D' && gradeB !== 'D') return 1;
    if (gradeA !== 'D' && gradeB === 'D') return -1;
    return scoreB - scoreA;
  });
  
  if (sortedListings.length === 0) {
    container.innerHTML = `暂无房源数据，无法生成决策报告。`;
    return;
  }
  
  let md = `# 租房决策 Deal：上海长期租房候选方案选择报告\n\n`;
  md += `> 本报告由 **上海租房地图** 理性决策评分引擎自动生成。评测基于 3–5 年长期居住需求，高权重锁定“小区环境、安静度、人车分流、真三房功能与 WFH 书房适配”。\n\n`;
  
  md += `## 1. 候选房源总排名\n\n`;
  md += `| 排名 | 小区 | 具体房源 | 综合分 | 推荐等级 | 核心理由 | 主要风险 |\n`;
  md += `| :---: | :--- | :--- | :---: | :---: | :--- | :--- |\n`;
  
  let topPick = null;
  let runnerUp = null;
  let excludedList = [];
  
  let rankIndex = 1;
  sortedListings.forEach(l => {
    const score = calculateScore(l);
    const grade = determineGrade(l, score);
    
    let rankText = rankIndex;
    if (grade === 'D') {
      rankText = '淘汰';
      excludedList.push(l);
    } else {
      if (!topPick) {
        topPick = l;
      } else if (!runnerUp) {
        runnerUp = l;
      }
      rankIndex++;
    }
    
    const reason = grade === 'D' ? '触发一票否决红线规避' : 
                   (score >= 85 ? '小区绿化、静谧度极佳，真三房与书房完美匹配WFH' : '综合素质良好，能支撑长租');
    const risk = grade === 'D' ? '红线硬伤不可忽视' : 
                 (l.rent > 19000 ? '租金溢价偏高，合同需防涨租风险' : '书房面积偏小或小区散步感弱');
    
    md += `| ${rankText} | ${l.community} | ${l.unit_id} | ${score} | **${grade}** | ${reason} | ${risk} |\n`;
  });
  md += `\n---\n\n`;
  
  md += `## 2. 每套房源的详细打分与深度透视\n\n`;
  
  sortedListings.forEach((l, index) => {
    const score = calculateScore(l);
    const grade = determineGrade(l, score);
    
    md += `### 房源 ${index + 1}：${l.community} / ${l.unit_id}\n\n`;
    md += `- **综合评分**：${score} / 100\n`;
    md += `- **推荐等级**：**${grade} 级** (${grade === 'S' ? '强烈推荐' : grade === 'A' ? '推荐' : grade === 'B' ? '备选' : grade === 'C' ? '不推荐' : '淘汰'})\n`;
    md += `- **基本配置**：${l.area_sqm} ㎡ | ${l.bedroom_count} 房 | ${l.floor} | 朝${l.orientation} | 租金 ${l.rent} 元/月\n\n`;
    
    md += `#### 🟢 核心优势\n`;
    md += `- **室内居住体验**：${l.layout_comment || '真三房，可实现独立安静书房。'}\n`;
    md += `- **小区绿化与散步感**：${l.greenery || '绿化良好，适合每日散步。'}\n`;
    md += `- **物业与安全**：${l.property_management || '物业管理正规，公区干净。'}\n\n`;
    
    md += `#### 🔴 核心短板与风险\n`;
    md += `- **噪音与采光**：${l.noise_risk || '现场需核查噪音与低区采光。'}\n`;
    md += `- **车位与分流**：${l.car_pedestrian_separation || '是否100%人车分流。'}\n`;
    md += `- **租约与房东稳定性**：${l.lease_terms || '是否能稳签3年。'} ${l.landlord_risk || ''}\n\n`;
    
    md += `#### 📊 5维量化评分明细 (1-10分)\n`;
    md += `1. **小区长期居住质量 (35%)**：**${l.dim_a}分** (绿化、安静、人车分流)\n`;
    md += `2. **户型与室内生活质量 (30%)**：**${l.dim_b}分** (真三房、WFH书房舒适度)\n`;
    md += `3. **租金、合同与性价比 (15%)**：**${l.dim_c}分** (租金压力与合同长租可能)\n`;
    md += `4. **地段与生活便利 (10%)**：**${l.dim_d}分** (周边散步、地铁商业)\n`;
    md += `5. **规避风险与确定性 (10%)**：**${l.dim_e}分** (楼上邻居、装修老化与房东稳定)\n\n`;
    
    md += `#### 🔍 看房时必须实地确认的细节\n`;
    md += `1. 书房隔音：在工作时间，关闭书房门窗实测室内分贝，特别是上午 9:00 - 11:00 周边人流或马路胎噪。\n`;
    md += `2. 散步动线：现场步行环绕小区，查看是否真正做到了车辆不侵占人行道，是否有垃圾堆积异味。\n`;
    md += `3. 房东沟通：明确询问房东“未来3年有无置换或变卖打算”，并落实“大件家电自然损耗的维修责任划分”。\n\n`;
    md += `---\n\n`;
  });
  
  md += `## 3. 最终理性决策建议\n\n`;
  
  if (topPick) {
    const topScore = calculateScore(topPick);
    md += `### 🥇 唯一首选推荐：${topPick.community} (${topPick.unit_id})\n\n`;
    md += `**推荐理由**：\n`;
    md += `1. **完美的长期居住环境**：在 A、B 两个最高权重维度（小区环境、真三房书房）中获得最高得分，绿化、安静度和人车分流质量极高，可提供极佳的每日散步体验。\n`;
    md += `2. **卓越的 WFH 生产力适配**：独立的书房采光充沛，避开了主要马路噪音源，空间舒适不压抑，完美契合您每周多日在家办公的需求。\n`;
    md += `3. **高稳定的租约预期**：合同条款对租户友好，房东配合签署 3 年长约，承诺租期内不涨租，免除了长租期间频繁搬家的动荡成本。\n\n`;
  }
  
  if (runnerUp) {
    md += `### 🥈 次选后备方案：${runnerUp.community} (${runnerUp.unit_id})\n\n`;
    md += `**推荐理由**：\n`;
    md += `- 该房源同样在核心指标上满足了真三房和独立书房的硬性需求，地段生活极其便利。但由于租金存在轻微溢价，或合同条款中对于 2 年后的租金涨幅存在一定的不确定性，故列为次选方案。适合在与首选房源谈判未果时作为强力后备，具有极高重合度。\n\n`;
  }
  
  if (excludedList.length > 0) {
    md += `### ❌ 坚决淘汰/避坑名单\n\n`;
    excludedList.forEach(l => {
      md += `- **${l.community} (${l.unit_id})**：\n`;
      md += `  - **淘汰核心原因**：严重触发了租房一票否决红线（例如：非真三房布局、书房无窗极其压抑、小区人车混杂停满私车、物业管理水平极其混乱，或房东正在出售产权无法签稳定长约）。3-5年的长期居住，这些隐性伤痛会被时间无限放大，切勿因为低价或一时的地段光环妥协。\n`;
    });
    md += `\n`;
  }
  
  container.innerText = md;
}

// Generate checkable Viewing Checklist for selected listing
function renderChecklist() {
  const select = document.getElementById('checklist-selector');
  const renderArea = document.getElementById('checklist-render-area');
  if (!select || !renderArea) return;
  
  const oldVal = select.value;
  select.innerHTML = '';
  
  listings.forEach(l => {
    const option = document.createElement('option');
    option.value = l.id;
    option.innerText = `${l.community} - ${l.unit_id}`;
    select.appendChild(option);
  });
  
  if (listings.length === 0) {
    renderArea.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">暂无房源，无法生成看房清单。</div>`;
    return;
  }
  
  if (oldVal && listings.some(l => l.id === oldVal)) {
    select.value = oldVal;
  }
  
  const selectedId = select.value;
  const listing = listings.find(l => l.id === selectedId);
  
  if (!listing) return;
  
  const checklistData = [
    {
      category: "🌳 A. 小区长期居住环境核实",
      items: [
        { id: "ch-a1", text: "小区散步实测：绕小区中心漫步15分钟，观察绿化植物维护程度、水景是否运行、有无蚊虫异味。" },
        { id: "ch-a2", text: "人车分流检验：观察路面是否有乱停的私家车、外卖电瓶车是否疯狂穿梭，人行道路是否平整。" },
        { id: "ch-a3", text: "物业公区核实：走进楼栋入户大堂、电梯间、通道，检查是否有堆放杂物垃圾、电梯运行有无异声异震。" },
        { id: "ch-a4", text: "社区安静体验：驻足听5分钟，感受周边是否有大声广播、广场舞噪音或周边道路工程声噪。" }
      ]
    },
    {
      category: "🖥️ B. 户型与 WFH 独立书房核实",
      items: [
        { id: "ch-b1", text: "书房隔音实测：关闭书房门窗，由同伴在客厅看电视或说话，测试工作时的防干扰隔音效果。" },
        { id: "ch-b2", text: "书房采光与面宽：肉眼检查书房白天光照，用卷尺核实书房墙距是否能容纳大型双屏办公桌（至少1.2米面宽）。" },
        { id: "ch-b3", text: "室内收纳与层高：检查有无全屋收纳大衣柜，感受天花板层高是否压抑（不建议低于2.6米）。" },
        { id: "ch-b4", text: "厨卫五金水压：打开厨卫水龙头，测试水压与热水出水速度；马桶冲水是否顺畅有力。" }
      ]
    },
    {
      category: "💰 C. 租金、合同与性价比核实",
      items: [
        { id: "ch-c1", text: "3年稳定租约承诺：当面要求中介或房东落实“可稳签3年，前两年不涨租，第3年涨租不超3%”是否能写入合同。" },
        { id: "ch-c2", text: "付款方式核实：是否接受押一付三或押二付一，有无物业费、垃圾费等隐性附加收费项目。" },
        { id: "ch-c3", text: "家具家电维修划分：明确合同中必须注明“冰箱、洗衣机、空调、地暖、热水器等大件家电的自然折旧维修费用由房东承担”。" }
      ]
    },
    {
      category: "🧭 D. 地段与外部生活便利核实",
      items: [
        { id: "ch-d1", text: "周边商业与咖啡馆：步行500米实测是否有便利店、生鲜超市，以及适合偶尔办公/换脑子的咖啡馆。" },
        { id: "ch-d2", text: "可散步绿化空间：出小区5-10分钟，是否连接公园、河边慢跑道或开阔的绿地广场。" },
        { id: "ch-d3", text: "通勤与交通便利度：实测步行到地铁口真实时间，高德地图核实早高峰去办公室的网约车打车时间与拥堵段。" }
      ]
    },
    {
      category: "⚠️ E. 规避隐性痛点与确定性核实",
      items: [
        { id: "ch-e1", text: "上下邻里噪音隐患：轻轻敲打墙面看是否为实心砖墙隔音；向保安或保洁询问楼上是否有养宠物、小孩子吵闹情况。" },
        { id: "ch-e2", text: "设备老化检查：检查地暖开关是否可用，空调出风是否有异味，墙脚有无回潮发霉发黑的墙纸痕迹。" },
        { id: "ch-e3", text: "房东售房风险排查：进入二手房App（如链家）搜索该房源，确认房东是否同时将此房挂牌在售。若在售，坚决否决！" }
      ]
    }
  ];
  
  let html = '';
  const currentListingChecklist = checkedChecklistItems[selectedId] || {};
  
  checklistData.forEach(section => {
    html += `
      <div class="checklist-section">
        <h4>${section.category}</h4>
    `;
    
    section.items.forEach(item => {
      const isChecked = currentListingChecklist[item.id] || false;
      html += `
        <div class="checklist-item ${isChecked ? 'checked' : ''}" onclick="toggleChecklistItem('${selectedId}', '${item.id}')">
          <input type="checkbox" class="checklist-check" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleChecklistItem('${selectedId}', '${item.id}')">
          <span>${escapeHtml(item.text)}</span>
        </div>
      `;
    });
    
    html += `</div>`;
  });
  
  renderArea.innerHTML = html;
}

// Toggle checklist item status
window.toggleChecklistItem = function(listingId, itemId) {
  if (!checkedChecklistItems[listingId]) {
    checkedChecklistItems[listingId] = {};
  }
  
  checkedChecklistItems[listingId][itemId] = !checkedChecklistItems[listingId][itemId];
  saveState();
  renderChecklist();
};

// HTML escaping helper to prevent XSS
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Add/Edit listing form submit
document.getElementById('listing-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const editIndex = parseInt(document.getElementById('edit-index').value);
  if (editIndex < 0) {
    closeForm();
    return;
  }
  
  const listing = listings[editIndex];
  
  // Only update curation parameters
  listing.layout_comment = document.getElementById('f-layout-comment').value.trim();
  listing.lease_terms = document.getElementById('f-lease-terms').value.trim();
  listing.viewing_notes = document.getElementById('f-viewing-notes').value.trim();
  
  // Sliders
  listing.dim_a = parseInt(document.getElementById('f-dim-a').value);
  listing.dim_b = parseInt(document.getElementById('f-dim-b').value);
  listing.dim_c = parseInt(document.getElementById('f-dim-c').value);
  listing.dim_d = parseInt(document.getElementById('f-dim-d').value);
  listing.dim_e = parseInt(document.getElementById('f-dim-e').value);
  
  // Red Lines
  listing.rl_not_three_bed = document.getElementById('rl-not-three-bed').checked;
  listing.rl_car_messy = document.getElementById('rl-car-messy').checked;
  listing['rl_wfh-bad'] = document.getElementById('rl-wfh-bad').checked;
  listing.rl_wfh_bad = document.getElementById('rl-wfh-bad').checked;
  listing.rl_property_bad = document.getElementById('rl-property-bad').checked;
  listing.rl_lease_unstable = document.getElementById('rl-lease-unstable').checked;
  
  // Derive extra details based on curation
  listing.noise_risk = `打分${listing.dim_b}对应噪音评测：` + (listing.dim_b >= 8 ? "噪音低，书房静谧度好" : "中低层采光一般，存在少许周围人流喧闹/胎噪风险");
  listing.greenery = `打分${listing.dim_a}对应小区环境：` + (listing.dim_a >= 8 ? "绿化成熟开阔，水系与步行路网完善" : "绿化一般，步行环路较窄");
  listing.car_pedestrian_separation = listing.rl_car_messy ? "人车未彻底分流，路面占道停车，尾气多" : "人车分流彻底，步行安全度高";
  listing.property_management = listing.rl_property_bad ? "物业极其混乱，公区卫生与安保堪忧" : (listing.dim_a >= 8 ? "高品质物业维护，保洁高频，绿化精细" : "普通物业，安保与保洁维护正常");
  listing.landlord_risk = listing.rl_lease_unstable ? "高变卖收回风险" : (listing.dim_e >= 8 ? "房东为高净值投资，不自住不卖，配合长约" : "房东正常持有，可能面临资产重组诉求");
  
  saveState();
  closeForm();
  
  // Render active tab views
  renderDashboard();
  renderCompareMatrix();
  renderReport();
  renderChecklist();
});

// Edit listing function
window.editListing = function(index) {
  const listing = listings[index];
  
  document.getElementById('form-title').innerText = `房源定制评测与看房备注：${listing.community}`;
  document.getElementById('edit-index').value = index;
  
  // Read-only info displays
  document.getElementById('view-community').innerText = listing.community;
  document.getElementById('view-unit-id').innerText = listing.unit_id;
  document.getElementById('view-rent').innerText = listing.rent;
  document.getElementById('view-area').innerText = listing.area_sqm;
  document.getElementById('view-bedroom').innerText = listing.bedroom_count;
  document.getElementById('view-orientation').innerText = listing.orientation;
  document.getElementById('view-floor').innerText = listing.floor;
  document.getElementById('view-renovation').innerText = listing.renovation;
  
  const linkNode = document.getElementById('view-detail-url');
  let url = listing.detail_url;
  if (!url || !url.startsWith('http')) {
    if (listing.id.startsWith('lst-SH')) {
      url = `https://sh.lianjia.com/zufang/${listing.id.replace('lst-', '')}.html`;
    } else {
      url = `https://sh.lianjia.com/zufang/rs${encodeURIComponent(listing.community)}/`;
    }
  }
  linkNode.href = url;
  
  // Editable fields
  document.getElementById('f-layout-comment').value = listing.layout_comment || '';
  document.getElementById('f-lease-terms').value = listing.lease_terms || '';
  document.getElementById('f-viewing-notes').value = listing.viewing_notes || '';
  
  // Sliders
  document.getElementById('f-dim-a').value = listing.dim_a || 5;
  document.getElementById('f-dim-b').value = listing.dim_b || 5;
  document.getElementById('f-dim-c').value = listing.dim_c || 5;
  document.getElementById('f-dim-d').value = listing.dim_d || 5;
  document.getElementById('f-dim-e').value = listing.dim_e || 5;
  
  // Update slider numeric readouts
  updateSliderLabels();
  
  // Red Lines
  document.getElementById('rl-not-three-bed').checked = listing.rl_not_three_bed || false;
  document.getElementById('rl-car-messy').checked = listing.rl_car_messy || false;
  document.getElementById('rl-wfh-bad').checked = listing['rl_wfh-bad'] || listing.rl_wfh_bad || false;
  document.getElementById('rl-property-bad').checked = listing.rl_property_bad || false;
  document.getElementById('rl-lease-unstable').checked = listing.rl_lease_unstable || false;
  
  // Show form card
  document.getElementById('listing-form-card').style.display = 'block';
  document.getElementById('listing-form-card').scrollIntoView({ behavior: 'smooth' });
};

// Delete listing function
window.deleteListing = function(index) {
  if (confirm(`确认要删除 ${listings[index].community} / ${listings[index].unit_id} 吗？`)) {
    listings.splice(index, 1);
    saveState();
    renderDashboard();
    renderCompareMatrix();
    renderReport();
    renderChecklist();
  }
};

// Form close and reset
function closeForm() {
  const card = document.getElementById('listing-form-card');
  if (card) card.style.display = 'none';
  const form = document.getElementById('listing-form');
  if (form) form.reset();
  const editIdxInput = document.getElementById('edit-index');
  if (editIdxInput) editIdxInput.value = "-1";
  const title = document.getElementById('form-title');
  if (title) title.innerText = "房源定制评测与看房备注";
  updateSliderLabels();
}

const cancelBtn = document.getElementById('btn-cancel-form');
if (cancelBtn) cancelBtn.addEventListener('click', closeForm);

// Tab Switch Logic
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    const contentEl = document.getElementById(tabId);
    if (contentEl) contentEl.classList.add('active');
    
    if (tabId === 'tab-compare') renderCompareMatrix();
    if (tabId === 'tab-report') renderReport();
    if (tabId === 'tab-checklist') renderChecklist();
  });
});

// Filters switch
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    renderDashboard();
  });
});

// Live Budget Input Filter
const budgetFilterEl = document.getElementById('budget-filter-input');
if (budgetFilterEl) budgetFilterEl.addEventListener('input', renderDashboard);

// Update Slider Numeric labels dynamically
const sliders = ['f-dim-a', 'f-dim-b', 'f-dim-c', 'f-dim-d', 'f-dim-e'];
sliders.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    const targetId = id.replace('f-', 'val-');
    el.addEventListener('input', () => {
      const label = document.getElementById(targetId);
      if (label) label.innerText = el.value;
    });
  }
});

function updateSliderLabels() {
  sliders.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const targetId = id.replace('f-', 'val-');
      const label = document.getElementById(targetId);
      if (label) label.innerText = el.value;
    }
  });
}

// Copy Report Markdown to Clipboard
const copyReportBtn = document.getElementById('btn-copy-report');
if (copyReportBtn) {
  copyReportBtn.addEventListener('click', () => {
    const reportTextEl = document.getElementById('report-md-content');
    if (!reportTextEl) return;
    const reportText = reportTextEl.innerText;
    
    navigator.clipboard.writeText(reportText).then(() => {
      const originalBtnText = copyReportBtn.innerText;
      copyReportBtn.innerText = '✅ 复制成功！';
      setTimeout(() => {
        copyReportBtn.innerText = originalBtnText;
      }, 2000);
    }).catch(err => {
      alert('复制失败，请双击下方文本框手动复制。');
    });
  });
}

// Selector change for Viewing Checklist
const checklistSelectorEl = document.getElementById('checklist-selector');
if (checklistSelectorEl) checklistSelectorEl.addEventListener('change', renderChecklist);

// Data Management: JSON Export
const exportDataBtn = document.getElementById('btn-export-data');
if (exportDataBtn) {
  exportDataBtn.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(listings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `shanghai_rent_map_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });
}

// Data Management: JSON Import
const importFileInputEl = document.getElementById('import-file-input');
if (importFileInputEl) {
  importFileInputEl.addEventListener('change', function(e) {
    const fileReader = new FileReader();
    
    if (e.target.files.length === 0) return;
    
    fileReader.onload = function(event) {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (Array.isArray(parsedData)) {
          if (confirm(`检测到 ${parsedData.length} 套房源数据。是否覆盖当前列表？`)) {
            listings = parsedData;
            saveState();
            
            renderDashboard();
            renderCompareMatrix();
            renderReport();
            renderChecklist();
            
            alert('数据覆盖并还原成功！');
          }
        } else {
          alert('文件格式错误！导入的JSON必须是房源数组。');
        }
      } catch(err) {
        alert('解析JSON文件失败，请确认文件是否完整。');
      }
    };
    
    fileReader.readAsText(e.target.files[0]);
    e.target.value = '';
  });
}

// Data Management: Data Wipe
const resetDataBtn = document.getElementById('btn-reset-data');
if (resetDataBtn) {
  resetDataBtn.addEventListener('click', () => {
    if (confirm('🚨 警告：这会清空本地所有房源数据！确认继续吗？')) {
      listings = [];
      checkedChecklistItems = {};
      saveState();
      
      renderDashboard();
      renderCompareMatrix();
      renderReport();
      renderChecklist();
      
      alert('已成功清空所有本地存储数据。');
    }
  });
}

// Data Management: Load Defaults
const loadDefaultsBtn = document.getElementById('btn-load-defaults');
if (loadDefaultsBtn) {
  loadDefaultsBtn.addEventListener('click', () => {
    if (confirm('这会重置当前列表并重新加载精选默认评测案例。确认继续吗？')) {
      listings = [...DEFAULT_LISTINGS];
      checkedChecklistItems = {};
      saveState();
      
      renderDashboard();
      renderCompareMatrix();
      renderReport();
      renderChecklist();
      
      alert('默认评测案例加载成功！');
    }
  });
}

// Initialize App
loadState();
renderDashboard();
renderCompareMatrix();
renderReport();
renderChecklist();
