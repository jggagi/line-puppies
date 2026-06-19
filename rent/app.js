// State Management
let listings = [];
let currentFilter = 'available';
let checkedChecklistItems = {}; // { listingId: { itemId: true/false } }

// Weights
const WEIGHTS = {
  a: 0.35, // 小区长期居住质量
  b: 0.30, // 户型与室内生活质量
  c: 0.15, // 租金、合同与性价比
  d: 0.10, // 地段与生活便利
  e: 0.10  // 风险与不确定性
};

// Community Ecological Data Mapping (High Fidelity Shanghai Indicators)
const COMMUNITY_METRICS = {
  "上海绿城": { greenery_rate: 0.45, plot_ratio: 2.2, building_density: 0.25 },
  "仁恒河滨城": { greenery_rate: 0.60, plot_ratio: 2.7, building_density: 0.18 },
  "香梅花园": { greenery_rate: 0.50, plot_ratio: 1.8, building_density: 0.20 },
  "陆家嘴中央公寓": { greenery_rate: 0.40, plot_ratio: 2.1, building_density: 0.22 },
  "联洋年华": { greenery_rate: 0.40, plot_ratio: 2.0, building_density: 0.23 },
  "爱家亚洲花园": { greenery_rate: 0.35, plot_ratio: 2.6, building_density: 0.26 },
  "涵合园": { greenery_rate: 0.50, plot_ratio: 0.9, building_density: 0.15 },
  "锦绣满堂": { greenery_rate: 0.38, plot_ratio: 2.3, building_density: 0.24 },
  "水清木华": { greenery_rate: 0.28, plot_ratio: 2.5, building_density: 0.28 },
  "四季雅苑": { greenery_rate: 0.55, plot_ratio: 0.38, building_density: 0.12 }
};

// 办公锚点：每周 3 天陆家嘴环球金融中心（世纪大道100号），其余 4 天 WFH
const OFFICE_SWFC = {
  name: '陆家嘴环球金融中心',
  address: '浦东新区世纪大道100号',
  workDaysPerWeek: 3,
  wfhDaysPerWeek: 4
};

// 各小区 → 环球金融中心：地铁 / 公交 / 自驾（早高峰口径，含到站步行）
const COMMUTE_TO_SWFC = {
  "四季雅苑": {
    nearest_metro: "世纪公园(2号线)约10-12分钟步行；花木路(7号线)约8-10分钟",
    metro_route: "推荐：步行至世纪公园站 → 2号线至陆家嘴站 → 步行/天桥至环球金融中心（约32-42分钟）",
    metro_peak_min: 38,
    bus_route: "983/987路等至龙阳路/世纪公园枢纽再转2号线；无直达，高峰约45-60分钟，仅雨天备选",
    bus_peak_min: 52,
    drive_route: "花木路 → 锦绣路/杨高南路 → 内环高架 → 陆家嘴环路",
    drive_offpeak_min: 22,
    drive_peak_min: 42,
    parking_note: "SWFC地下停车约15元/60分钟；每周自驾3天约500-900元/月",
    commute_score: 8,
    caveat: "2号线直达优于7号线换乘；自驾早高峰内环陆家嘴段易排队"
  },
  "上海绿城": {
    nearest_metro: "锦绣路/杨高南路(7号线)约6-8分钟步行",
    metro_route: "7号线至龙阳路站 → 换乘2号线至陆家嘴（约40-50分钟，含换乘步行）",
    metro_peak_min: 45,
    bus_route: "794/东周线等经锦绣路浦建路，可至东昌路/陆家嘴环路段，高峰约50-65分钟",
    bus_peak_min: 55,
    drive_route: "浦建路/锦绣路 → 杨高南路 → 内环 → 陆家嘴",
    drive_offpeak_min: 25,
    drive_peak_min: 45,
    parking_note: "SWFC地下停车约15元/60分钟",
    commute_score: 7,
    caveat: "地铁需一次换乘；794路公交受路况影响大"
  },
  "仁恒河滨城": {
    nearest_metro: "芳甸路(9号线)约8-10分钟步行",
    metro_route: "9号线至世纪大道站 → 换乘2号线至陆家嘴（约35-45分钟）",
    metro_peak_min: 40,
    bus_route: "联洋板块公交少，不建议作为主力；可打车至2号线龙阳路/世纪公园约15分钟",
    bus_peak_min: 50,
    drive_route: "罗山路/杨高路 → 内环 → 陆家嘴，约9-11公里",
    drive_offpeak_min: 20,
    drive_peak_min: 38,
    parking_note: "SWFC地下停车约15元/60分钟",
    commute_score: 8,
    caveat: "9号线早高峰芳甸路-世纪大道段较挤；自驾平峰体验好"
  },
  "香梅花园": {
    nearest_metro: "世纪公园(2号线)约8-10分钟步行",
    metro_route: "步行至世纪公园站 → 2号线直达陆家嘴（约28-38分钟，含站内及楼口步行）",
    metro_peak_min: 33,
    bus_route: "东周线/794经花木路，可至东昌路附近，高峰约45-55分钟",
    bus_peak_min: 48,
    drive_route: "梅花路/白杨路 → 龙阳路 → 内环 → 陆家嘴，约8公里",
    drive_offpeak_min: 18,
    drive_peak_min: 35,
    parking_note: "SWFC地下停车约15元/60分钟",
    commute_score: 9,
    caveat: "2号线直达为板块最优轨交方案"
  },
  "陆家嘴中央公寓": {
    nearest_metro: "上海科技馆/世纪公园(2号线)约10-15分钟步行",
    metro_route: "2号线直达陆家嘴（约25-35分钟，花木板块轨交最近之一）",
    metro_peak_min: 30,
    bus_route: "796/583等至东昌路/浦东南路，高峰约35-50分钟",
    bus_peak_min: 42,
    drive_route: "锦带路/梅花路 → 内环 → 陆家嘴，约6-8公里",
    drive_offpeak_min: 15,
    drive_peak_min: 32,
    parking_note: "SWFC地下停车约15元/60分钟；自驾3天/周性价比相对最高",
    commute_score: 9,
    caveat: "职住距离最近，但需用居住安静度对冲花木路车流"
  },
  "联洋年华": {
    nearest_metro: "芳甸路(9号线)约6-8分钟步行",
    metro_route: "9号线至世纪大道 → 2号线至陆家嘴（约35-45分钟）",
    metro_peak_min: 40,
    bus_route: "联洋内部公交稀疏，不建议依赖",
    bus_peak_min: 55,
    drive_route: "芳甸路 → 罗山路 → 内环 → 陆家嘴",
    drive_offpeak_min: 20,
    drive_peak_min: 38,
    parking_note: "SWFC地下停车约15元/60分钟",
    commute_score: 8,
    caveat: "与仁恒类似，轨交一次换乘"
  },
  "爱家亚洲花园": {
    nearest_metro: "东三里桥/临沂新村(6号线)约10-15分钟步行",
    metro_route: "6号线至世纪大道 → 2号线至陆家嘴（约45-55分钟，两次换乘动线）",
    metro_peak_min: 50,
    bus_route: "781/610等至浦东南路，高峰约50-70分钟",
    bus_peak_min: 58,
    drive_route: "浦三路/东方路 → 南浦大桥/内环 → 陆家嘴",
    drive_offpeak_min: 22,
    drive_peak_min: 45,
    parking_note: "SWFC地下停车约15元/60分钟",
    commute_score: 7,
    caveat: "轨交换乘多，早高峰南浦/内环段波动大"
  },
  "涵合园": {
    nearest_metro: "最近为芳甸路/世纪公园，步行或骑行约15-20分钟",
    metro_route: "需先接驳至9号线或2号线，全程约50-65分钟，不适合作为3天通勤主力",
    metro_peak_min: 58,
    bus_route: "几乎无可靠直达线路，依赖打车接驳",
    bus_peak_min: 65,
    drive_route: "锦绣路 → 内环 → 陆家嘴，约10-12公里",
    drive_offpeak_min: 25,
    drive_peak_min: 48,
    parking_note: "轨交弱时自驾更现实，但高峰时间不可控",
    commute_score: 5,
    caveat: "职住通勤是明显短板，仅适合WFH占比更高的方案"
  },
  "锦绣满堂": {
    nearest_metro: "芳甸路(9号线)约10-12分钟步行",
    metro_route: "9号线至世纪大道 → 2号线至陆家嘴（约38-48分钟）",
    metro_peak_min: 43,
    bus_route: "联洋公交少，不建议",
    bus_peak_min: 55,
    drive_route: "锦绣路 → 内环 → 陆家嘴",
    drive_offpeak_min: 22,
    drive_peak_min: 40,
    parking_note: "SWFC地下停车约15元/60分钟",
    commute_score: 8,
    caveat: "轨交与联洋年华/仁恒接近"
  },
  "水清木华": {
    nearest_metro: "世纪公园(2号线)约5-8分钟步行",
    metro_route: "2号线直达陆家嘴（约25-35分钟）",
    metro_peak_min: 30,
    bus_route: "796等至东昌路，高峰约40-55分钟",
    bus_peak_min: 45,
    drive_route: "锦带路 → 内环 → 陆家嘴，约7公里",
    drive_offpeak_min: 16,
    drive_peak_min: 35,
    parking_note: "SWFC地下停车约15元/60分钟",
    commute_score: 9,
    caveat: "轨交近但小区品质红线需单独评估"
  }
};

function getCommuteProfile(community) {
  if (!community) return null;
  if (COMMUTE_TO_SWFC[community]) return COMMUTE_TO_SWFC[community];
  const key = Object.keys(COMMUTE_TO_SWFC).find(k => community.includes(k) || k.includes(community));
  return key ? COMMUTE_TO_SWFC[key] : null;
}

function getEffectiveDimD(listing) {
  const profile = getCommuteProfile(listing.community);
  const manual = listing.dim_d ?? 7;
  if (!profile) return manual;
  return Math.min(10, Math.max(1, Math.round(manual * 0.35 + profile.commute_score * 0.65)));
}

function enrichListingSwfcCommute(listing) {
  const p = getCommuteProfile(listing.community);
  if (!p) return;
  listing.commute_office = OFFICE_SWFC.name;
  listing.commute_metro = p.metro_route;
  listing.commute_bus = p.bus_route;
  listing.commute_drive = `${p.drive_route}（平峰约${p.drive_offpeak_min}分钟，早高峰约${p.drive_peak_min}分钟）`;
  listing.commute_parking = p.parking_note;
  listing.commute_peak_metro_min = p.metro_peak_min;
  listing.commute_peak_drive_min = p.drive_peak_min;
  listing.commute_score_swfc = p.commute_score;
  listing.commute = `【每周${OFFICE_SWFC.workDaysPerWeek}天·${OFFICE_SWFC.name}】🚇 ${p.metro_route} | 🚌 ${p.bus_route} | 🚗 ${listing.commute_drive}。${p.caveat || ''}`;
}

function enrichAllListingsSwfcCommute() {
  listings.forEach(enrichListingSwfcCommute);
}

/** 在租优先 → 非红线 → 综合分从高到低 */
function sortListingsByScoreAvailable(items) {
  return [...items].sort((a, b) => {
    const aOff = !!a.is_offline;
    const bOff = !!b.is_offline;
    if (aOff !== bOff) return aOff ? 1 : -1;

    const scoreA = calculateScore(a);
    const scoreB = calculateScore(b);
    const gradeA = determineGrade(a, scoreA);
    const gradeB = determineGrade(b, scoreB);
    if (gradeA === 'D' && gradeB !== 'D') return 1;
    if (gradeA !== 'D' && gradeB === 'D') return -1;

    if (scoreB !== scoreA) return scoreB - scoreA;
    return (a.community || '').localeCompare(b.community || '', 'zh-CN');
  });
}


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
  },
  {
    id: "lst-SH30782910",
    community: "四季雅苑",
    unit_id: "3室 / 8/12层 / 128㎡",
    rent: 16800,
    area_sqm: 128,
    bedroom_count: 3,
    has_independent_study: true,
    floor: "8/12层",
    orientation: "南北",
    layout_comment: "花木世纪公园旁和黄低密社区内公寓三房，南北通透正气。北向次卧可作独立书房，窗景面向内部浓荫绿地，安静度与采光均优，极适合长期 WFH。需现场确认楼栋入口是否有台阶——部分低密组团对轮椅推行不够友好。",
    renovation: "经典精装保养良好",
    noise_risk: "极低噪音，远离主干道，内部环路仅有偶发邻里步行声",
    greenery: "和记黄埔打造的花木低密标杆，绿化率高达55%，内部林荫步道与中央绿地极具散步质感，紧邻世纪公园延伸绿廊",
    car_pedestrian_separation: "低密别墅区人车分流严格，主干道车流极少，步行环道安静安全",
    property_management: "和记物业口碑稳定，公区保洁与绿化修剪频率高，门禁与访客管理较严",
    community_atmosphere: "高端自住为主，外籍与高管家庭占比高，社区氛围安静有序，整体熵值极低",
    daily_convenience: "步行可达世纪公园与大拇指广场，2号线世纪公园站约800-1000米，生活医疗配套成熟",
    commute: "打车到陆家嘴约15-20分钟，世纪公园站地铁便利，雨天打车接单率高",
    lease_terms: "押一付三，可谈3年长约，但房东普遍对涨幅保留5%以内调整空间",
    landlord_risk: "中低风险。标的稀缺租金偏高，多数房东持有多套资产，愿意长租但难完全锁死不涨租",
    viewing_notes: "小区散步质感接近香梅/绿城第一梯队，公区极静。务必实测：① 楼栋到电梯/入户是否有台阶；② 书房窗景是否被乔木冬季挡光；③ 同户型挂牌价是否明显高于15k心理线。",
    dim_a: 10,
    dim_b: 8,
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
  }
];

// Helper: Calculate Score out of 100 based on weights
function calculateScore(listing) {
  const dimD = getEffectiveDimD(listing);
  const score = (
    listing.dim_a * WEIGHTS.a +
    listing.dim_b * WEIGHTS.b +
    listing.dim_c * WEIGHTS.c +
    dimD * WEIGHTS.d +
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
    const isTier1 = listing.community.includes('绿城') || listing.community.includes('仁恒') || listing.community.includes('四季雅苑');
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
  // Ensure every listing is fully populated with community ecological metrics
  listings.forEach(l => {
    const metrics = COMMUNITY_METRICS[l.community] || { greenery_rate: 0.35, plot_ratio: 2.2, building_density: 0.23 };
    l.greenery_rate = l.greenery_rate || metrics.greenery_rate;
    l.plot_ratio = l.plot_ratio || metrics.plot_ratio;
    l.building_density = l.building_density || metrics.building_density;
    enrichListingSwfcCommute(l);
  });
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
      enrichListingSwfcCommute(scraped);
      const existingIndex = listings.findIndex(l => l.id === scraped.id);
      if (existingIndex >= 0) {
        listings[existingIndex].rent = scraped.rent;
        listings[existingIndex].unit_id = scraped.unit_id;
        listings[existingIndex].floor = scraped.floor;
        listings[existingIndex].orientation = scraped.orientation;
        listings[existingIndex].is_offline = false;
        enrichListingSwfcCommute(listings[existingIndex]);
      } else {
        listings.push(scraped);
      }
    });
    
    // Inject and align community metrics dynamically on all active listings
    listings.forEach(l => {
      const metrics = COMMUNITY_METRICS[l.community] || { greenery_rate: 0.35, plot_ratio: 2.2, building_density: 0.23 };
      l.greenery_rate = l.greenery_rate || metrics.greenery_rate;
      l.plot_ratio = l.plot_ratio || metrics.plot_ratio;
      l.building_density = l.building_density || metrics.building_density;
    });

    enrichAllListingsSwfcCommute();
    saveState();
  } else {
    enrichAllListingsSwfcCommute();
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
    else if (currentFilter === 'available') matchesTier = !listing.is_offline;
    else if (currentFilter === 'S-A') matchesTier = (grade === 'S' || grade === 'A');
    else if (currentFilter === 'B') matchesTier = (grade === 'B');
    else if (currentFilter === 'D') matchesTier = (grade === 'D');
    
    const matchesBudget = isNaN(maxBudget) || listing.rent <= maxBudget;
    
    return matchesTier && matchesBudget;
  });
  
  const sortedListings = sortListingsByScoreAvailable(filteredListings);
  
  if (sortedListings.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div style="font-size: 48px;">🔍</div>
        <p style="margin-top: 10px;">没有找到符合当前过滤条件的房源数据</p>
      </div>
    `;
    return;
  }
  
  sortedListings.forEach((listing, index) => {
    const score = calculateScore(listing);
    const grade = determineGrade(listing, score);
    const globalIndex = listings.findIndex(l => l.id === listing.id);
    const rankLabel = listing.is_offline ? '' : `<span style="font-size:11px;font-weight:700;color:var(--accent-primary);margin-right:6px;">#${index + 1}</span>`;
    
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
          <h3>${rankLabel}${escapeHtml(listing.community)}${offlineBadge}</h3>
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
      
      <div class="property-ecology-badges" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px; margin-top: -4px;">
        <div class="badge-ecology green" title="小区成熟绿化率">🌳 绿化 ${Math.round((listing.greenery_rate || 0.35) * 100)}%</div>
        <div class="badge-ecology purple" title="小区开发容积率">🏢 容积率 ${(listing.plot_ratio || 2.2).toFixed(1)}</div>
        <div class="badge-ecology gold" title="建筑基底密度">📐 密度 ${Math.round((listing.building_density || 0.23) * 100)}%</div>
        ${listing.commute_peak_metro_min ? `<div class="badge-ecology" style="border-color: rgba(59,130,246,0.35); color: var(--accent-primary);" title="早高峰地铁至环球金融中心">🚇 地铁约${listing.commute_peak_metro_min}分</div><div class="badge-ecology" style="border-color: rgba(245,158,11,0.35); color: #f59e0b;" title="早高峰自驾">🚗 自驾约${listing.commute_peak_drive_min}分</div>` : ''}
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

// 陆家嘴环球金融中心通勤对比（按小区去重）
function renderSwfcCommutePanel() {
  const panel = document.getElementById('swfc-commute-panel');
  if (!panel) return;

  const communities = [...new Set(listings.map(l => l.community))].filter(c => getCommuteProfile(c));
  if (communities.length === 0) {
    panel.innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">暂无通勤数据。</p>';
    return;
  }

  const sorted = communities
    .map(name => ({ name, profile: getCommuteProfile(name) }))
    .sort((a, b) => a.profile.metro_peak_min - b.profile.metro_peak_min);

  let html = `
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
      办公锚点：<strong>${OFFICE_SWFC.name}</strong>（${OFFICE_SWFC.address}）·
      每周 <strong>${OFFICE_SWFC.workDaysPerWeek}</strong> 天到岗 /
      <strong>${OFFICE_SWFC.wfhDaysPerWeek}</strong> 天居家。
      D 维度评分已按「地铁 65% + 生活配套 35%」折算进综合分。
    </p>
    <div class="table-responsive">
      <table class="compare-table">
        <thead>
          <tr>
            <th>小区</th>
            <th>🚇 地铁（早高峰）</th>
            <th>🚌 公交</th>
            <th>🚗 自驾（平峰/高峰）</th>
            <th>通勤分</th>
          </tr>
        </thead>
        <tbody>`;

  sorted.forEach(({ name, profile: p }) => {
    html += `<tr>
      <td style="font-weight: 600;">${escapeHtml(name)}</td>
      <td style="font-size: 12px;">${escapeHtml(p.metro_route)}<br><span style="color: var(--accent-primary);">约 ${p.metro_peak_min} 分钟</span></td>
      <td style="font-size: 12px;">${escapeHtml(p.bus_route)}</td>
      <td style="font-size: 12px;">${escapeHtml(p.drive_route)}<br>平峰 ~${p.drive_offpeak_min}分 / 高峰 ~${p.drive_peak_min}分<br><span style="color: var(--text-muted);">${escapeHtml(p.parking_note)}</span></td>
      <td style="text-align: center; font-weight: 700;">${p.commute_score}/10</td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  panel.innerHTML = html;
}

// Side-by-side Comparison Matrix
function renderCompareMatrix() {
  renderSwfcCommutePanel();
  const table = document.getElementById('compare-table-el');
  if (!table) return;
  table.innerHTML = '';
  
  const activeListings = sortListingsByScoreAvailable(listings);
  
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
    { label: 'D. 地段便利 (10%,含通勤折算)', key: 'dim_d', isScore: true, format: (v, l) => {
      const eff = getEffectiveDimD(l);
      const raw = l.dim_d ?? '-';
      return eff !== raw ? `${eff} <span style="font-size:11px;color:var(--text-muted)">(录入${raw}×35%+通勤${l.commute_score_swfc || '-'}×65%)</span>` : `${eff}`;
    }},
    { label: 'E. 风险与不确定 (10%)', key: 'dim_e', isScore: true },
    { label: '🚇 地铁→环球金融中心', key: 'commute_metro' },
    { label: '🚌 公交备选', key: 'commute_bus' },
    { label: '🚗 自驾路线', key: 'commute_drive' },
    { label: '🅿️ 停车与成本', key: 'commute_parking' },
    { label: '早高峰地铁约(分钟)', key: 'commute_peak_metro_min' },
    { label: '早高峰自驾约(分钟)', key: 'commute_peak_drive_min' },
    
    { label: '小区绿化与散步感', key: 'greenery' },
    { label: '小区人车分流', key: 'car_pedestrian_separation' },
    { label: '物业管理与安全', key: 'property_management' },
    { label: '社区氛围与邻里', key: 'community_atmosphere' },
    { label: '生活商业便利性', key: 'daily_convenience' },
    { label: '综合通勤摘要', key: 'commute' },
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
      } else if (r.format) {
        val = r.format(l[r.key], l);
      } else if (r.isScore) {
        const rating = r.key === 'dim_d' ? getEffectiveDimD(l) : l[r.key];
        val = `<span style="font-weight: 600; color: var(--accent-primary);">${rating}</span>/10`;
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

// Render Ecological Visualization (Vanilla CSS horizontal charts)
function renderVisualization() {
  const containerGreenery = document.getElementById('chart-greenery');
  const containerPlotRatio = document.getElementById('chart-plot-ratio');
  const containerDensity = document.getElementById('chart-density');
  
  if (!containerGreenery || !containerPlotRatio || !containerDensity) return;
  
  containerGreenery.innerHTML = '';
  containerPlotRatio.innerHTML = '';
  containerDensity.innerHTML = '';
  
  // Find top recommended community (highest score among non-eliminated ones)
  let topCommunity = null;
  const validListings = sortListingsByScoreAvailable(
    listings.filter(l => {
      const s = calculateScore(l);
      return determineGrade(l, s) !== 'D' && !l.is_offline;
    })
  );
  
  if (validListings.length > 0) {
    topCommunity = validListings[0].community;
  }
  
  // Render charts for each community in COMMUNITY_METRICS
  Object.keys(COMMUNITY_METRICS).forEach(name => {
    const metrics = COMMUNITY_METRICS[name];
    const isHighlighted = (name === topCommunity);
    const rowClass = `chart-row ${isHighlighted ? 'highlighted' : ''}`;
    
    // 1. greenery rate (0% to 60%)
    const greeneryPct = Math.round(metrics.greenery_rate * 100);
    const greeneryBarPct = Math.min(100, Math.round((metrics.greenery_rate / 0.60) * 100));
    
    const rowGreenery = document.createElement('div');
    rowGreenery.className = rowClass;
    rowGreenery.innerHTML = `
      <div class="chart-row-meta">
        <span class="chart-row-label">${escapeHtml(name)}</span>
        <span class="chart-row-val">${greeneryPct}%</span>
      </div>
      <div class="chart-bar-container">
        <div class="chart-bar-track">
          <div class="chart-bar-fill bar-greenery" data-width="${greeneryBarPct}%" style="width: 0%;"></div>
        </div>
      </div>
    `;
    containerGreenery.appendChild(rowGreenery);
    
    // 2. plot ratio (0.0 to 3.0)
    const ratioVal = metrics.plot_ratio.toFixed(1);
    const ratioBarPct = Math.min(100, Math.round((metrics.plot_ratio / 3.0) * 100));
    
    const rowPlotRatio = document.createElement('div');
    rowPlotRatio.className = rowClass;
    rowPlotRatio.innerHTML = `
      <div class="chart-row-meta">
        <span class="chart-row-label">${escapeHtml(name)}</span>
        <span class="chart-row-val">${ratioVal}</span>
      </div>
      <div class="chart-bar-container">
        <div class="chart-bar-track">
          <div class="chart-bar-fill bar-plot-ratio" data-width="${ratioBarPct}%" style="width: 0%;"></div>
        </div>
      </div>
    `;
    containerPlotRatio.appendChild(rowPlotRatio);
    
    // 3. building density (0% to 30%)
    const densityPct = Math.round(metrics.building_density * 100);
    const densityBarPct = Math.min(100, Math.round((metrics.building_density / 0.30) * 100));
    
    const rowDensity = document.createElement('div');
    rowDensity.className = rowClass;
    rowDensity.innerHTML = `
      <div class="chart-row-meta">
        <span class="chart-row-label">${escapeHtml(name)}</span>
        <span class="chart-row-val">${densityPct}%</span>
      </div>
      <div class="chart-bar-container">
        <div class="chart-bar-track">
          <div class="chart-bar-fill bar-density" data-width="${densityBarPct}%" style="width: 0%;"></div>
        </div>
      </div>
    `;
    containerDensity.appendChild(rowDensity);
  });
  
  // Trigger growing width transitions
  setTimeout(() => {
    const bars = document.querySelectorAll('.chart-bar-fill');
    bars.forEach(bar => {
      const targetWidth = bar.getAttribute('data-width');
      if (targetWidth) {
        bar.style.width = targetWidth;
      }
    });
  }, 60);
}

// Generate Decision Report (Markdown)
function renderReport() {
  const container = document.getElementById('report-md-content');
  if (!container) return;
  
  const sortedListings = sortListingsByScoreAvailable(listings);
  
  if (sortedListings.length === 0) {
    container.innerHTML = `暂无房源数据，无法生成决策报告。`;
    return;
  }
  
  let md = `# 租房决策 Deal：上海长期租房候选方案选择报告\n\n`;
  md += `> 本报告由 **上海租房地图** 理性决策评分引擎自动生成。评测基于 3–5 年长期居住需求，高权重锁定“小区环境、安静度、人车分流、真三房功能与 WFH 书房适配”。\n\n`;
  
  md += `## 1. 候选房源总排名\n\n`;
  md += `| 排名 | 小区 | 具体房源 | 综合分 | 推荐等级 | 状态 | 核心理由 | 主要风险 |\n`;
  md += `| :---: | :--- | :--- | :---: | :---: | :---: | :--- | :--- |\n`;
  
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
    
    const status = l.is_offline ? '已下架' : '在租';
    md += `| ${rankText} | ${l.community} | ${l.unit_id} | ${score} | **${grade}** | ${status} | ${reason} | ${risk} |\n`;
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
    md += `4. **地段与生活便利 (10%)**：**${getEffectiveDimD(l)}分** (含每周3天环球金融中心通勤折算；录入${l.dim_d}分，通勤${l.commute_score_swfc || '-'}分)\n`;
    if (l.commute_metro) {
      md += `   - 🚇 地铁：${l.commute_metro}\n`;
      md += `   - 🚌 公交：${l.commute_bus || '-'}\n`;
      md += `   - 🚗 自驾：${l.commute_drive || '-'}\n`;
    }
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
  
  sortListingsByScoreAvailable(listings).forEach(l => {
    const score = calculateScore(l);
    const grade = determineGrade(l, score);
    const option = document.createElement('option');
    option.value = l.id;
    const avail = l.is_offline ? ' [已下架]' : '';
    option.innerText = `${score.toFixed(1)}分·${grade} ${l.community} - ${l.unit_id}${avail}`;
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
        { id: "ch-d3", text: "环球金融中心通勤实测：早高峰步行至地铁站计时；2号线直达 vs 换乘方案各走一次；高德导航自驾至世纪大道100号记录平峰/高峰；若开车记录SWFC停车入口与费用。" },
        { id: "ch-d4", text: "公交备选可信度：雨天试乘983/794等是否比地铁更快，还是仅增加不确定性。" }
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
    if (tabId === 'tab-visualize') renderVisualization();
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
