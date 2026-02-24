// ═══════════════════════════════════════════════════
// hymns.js — Hymn viewer, player, favorites, playlists
// Side panel: list / playlists
// Overlay (bibleScroll area): detail view (sheet + player)
// ═══════════════════════════════════════════════════

/* ── Section 1: Data Catalog ── */
var HYMN_MP3_SET = new Set([1,2,4,5,6,7,9,10,11,13,15,17,18,20,23,24,26,27,31,32,33,34,36,37,38,39,40,42,44,46,47,49,50,51,52,53,54,55,56,57,58,59,61,62,63,66,67,70,71,73,75,77,82,83,85,86,87,89,90,93,94,100,101,102,103,105,106,110,111,112,113,115,118,120,121,122,124,125,126,127,128,129,132,137,138,140,141,143,144,145,146,147,148,149,150,156,157,159,160,161,162,163,164,166,174,175,176,177,178,179,194,195,197,198,199,200,201,202,203,204,205,207,208,209,210,211,212,213,214,216,217,218,221,222,223,224,225,226,227,228,229,230,231,232,234,235,236,238,241,242,243,244,245,246,247,248,249,250,251,252,253,255,256,257,258,259,260,261,262,263,264,265,266,268,269,270,271,272,274,275,277,279,281,283,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,303,308,309,310,311,313,314,316,317,318,321,322,323,326,327,328,329,330,332,333,334,339,340,341,342,343,344,347,348,349,351,352,353,354,355,356,357,359,360,361,363,364,365,367,368,370,371,372,373,375,376,377,378,379,380,381,384,385,388,389,390,391,392,393,394,396,397,398,401,402,404,406,407,408,409,410,411,413,414,416,418,419,420,424,425,426,428,431,432,433,435,436,438,439,440,441,442,443,445,446,447,448,449,450,452,453,454,455,456,457,458,459,460,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,481,482,483,484,487,488,489,492,493,494,495,496,497,498,499,500,502,503,504,505,506,509,510,511,512,513,514,515,517]);
var HYMN_SHEET_SET = new Set([1,2,3,4,6,7,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25,27,28,30,31,32,33,35,36,37,38,39,41,42,43,44,45,47,48,49,50,52,53,55,56,57,58,60,61,62,63,64,65,66,67,68,69,70,72,73,75,76,77,78,79,81,82,83,84,86,87,88,89,90,91,92,94,95,97,98,100,101,102,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,125,126,128,129,130,131,133,135,136,137,138,139,141,142,144,145,146,147,148,150,152,154,155,156,158,159,160,162,163,164,165,166,168,169,171,172,173,176,177,178,179,191,193,194,195,197,198,199,200,201,202,203,204,205,207,208,209,210,212,213,214,216,217,219,221,222,223,224,225,226,228,229,230,231,232,233,235,236,238,239,241,242,243,244,245,246,247,248,250,251,253,254,255,256,257,258,259,260,261,262,263,264,265,266,268,269,270,272,273,275,276,278,279,280,281,282,284,285,287,288,289,290,291,293,294,295,296,297,298,299,300,301,302,303,305,306,307,308,309,310,311,312,313,314,315,316,317,319,320,321,322,324,326,327,329,330,331,332,334,335,337,338,340,341,343,344,345,346,347,348,349,350,352,354,355,357,358,360,361,363,364,365,366,367,368,369,371,372,373,374,376,378,379,380,381,382,383,384,386,388,389,390,392,393,395,396,397,398,399,400,401,403,405,407,409,410,411,412,413,414,415,416,417,419,420,421,422,423,424,425,426,427,429,430,431,432,433,434,436,437,439,440,441,443,444,446,447,448,449,450,451,452,453,454,455,456,458,459,460,462,463,464,466,467,468,469,470,472,474,475,477,479,480,481,483,487,489,491,492,493,495,497,498,499,501,503,504,505,507,508,509,510,511,512,513,514,515,516,518,519,520,521,522,523,524,525,526,527,529,530,531,532,534,535,536,537,538]);
var HYMN_ALL_IDS = (function(){
  var s = new Set(HYMN_MP3_SET);
  HYMN_SHEET_SET.forEach(function(id){ s.add(id); });
  return Array.from(s).sort(function(a,b){ return a-b; });
})();

var HYMN_TITLES_KO={1:'만복의 근원 하나님',2:'성부 성자 성령께',3:'이 천지간 만물들아',4:'성부 성자와 성령',5:'주 성부 성자 성령께',6:'찬양 성부 성자 성령',7:'구주와 왕이신 우리의 하나님',8:'목소리 높여서',9:'거룩 거룩 거룩',10:'거룩하신 하나님',11:'거룩한 주님께',12:'고난받은 주를 보라',13:'기뻐하며 경배하세',14:'구세주를 아는 이들',15:'내 영혼 이제 깨어서',16:'내 주는 살아 계시고',17:'내가 한 맘으로',18:'내 영혼아 곧 깨어',19:'내 영혼아 찬양하라',20:'다 감사 드리세',21:'다 찬양하여라',22:'다 함께 주를 경배하세',23:'만 입이 내게 있으면',24:'다 나와 찬송 드리세',25:'면류관 가지고',26:'만유의 주 앞에',27:'빛나고 높은 보좌와',28:'복의 근원 강림하사',29:'성도여 다 함께',30:'여호와 하나님',31:'영광의 왕께 다 경배하며',32:'오 하나님 우리의 창조주시니',33:'온 천하 만물 우러러',34:'전능왕 오셔서',35:'속죄하신 구세주를',36:'주예수 이름 높이어',37:'주 예수 이름 높이어',38:'주의 영광 빛나니',39:'주 은혜를 받으려',40:'주 하나님 지으신 모든 세계',41:'큰 영광 중에 계신 주',42:'찬란한 주의 영광은',43:'찬송으로 보답 할 수 없는',44:'찬송하는 소리 있어',45:'참 놀랍도다 주 크신 이름',46:'찬양하라 복되신 구세주 예수',47:'주여 우리 무리를',48:'만유의 주재',49:'참 즐거운 노래를',50:'큰 영화로신 주',51:'존귀와 영광',52:'햇빛을 받는 곳마다',53:'하늘에 가득 찬 영광의 하나님',54:'하나님이 친히',55:'하나님의 크신 사랑',56:'지난 이레 동안에',57:'즐겁게 안식할 날',58:'이 날은 주의 정하신',59:'성전을 떠나가기 전',60:'우리의 주여',61:'주여 복을 비옵나니',62:'주 이름으로 모였던',63:'서산으로 해질 때',64:'지난 밤에 나 고요히',65:'생명의 빛 예수여',66:'지난 밤에 보호하사',67:'영혼의 햇빛 예수여',68:'하나님 아버지 어둔 밤이 지나',69:'나 가진 모든것',70:'모든 것이 주께로부터',71:'내게 있는 모든 것을',72:'하나님이 언약하신 그대로',73:'내 눈을 들어 두루 살피니',74:'오 만세 반석이신',75:'저 높고 푸른 하늘과',76:'저 해와 달과 별들이',77:'전능의 하나님',78:'참 아름다와라',79:'피난처 있으니',80:'주 하나님 크신 능력',81:'귀하신 주의 이름은',82:'나의 기쁨 나의 소망 되시며',83:'나의 맘에 수심 구름',84:'나 어느 날 꿈 속을 헤메며',85:'구주를 생각만 해도',86:'내가 참 의지하는 예수',87:'내 주님 입으신 그 옷은',88:'내 진정 사모하는',89:'샤론의 꽃 예수',90:'성부의 어린 양이',91:'슬픈 마음 있는 사람',92:'어둠의 권세에서',93:'예수는 나의 힘이요',94:'예수님은 누구신가',95:'온 세상이 어두워 캄캄하나',96:'온 세상이 캄캄 하여서',97:'위에 계신 나의 친구',98:'주 예수 내가 알기 전',99:'주 예수 내 죄 속하니',100:'죄인 괴수 날 위해',101:'천지에 있는 이름 중',102:'주 예수 보다 더 귀한 것은 없네',103:'참 목자 우리 주',104:'곧 오소서 임마누엘',105:'오랫동안 기다리던',106:'이새의 뿌리에서',107:'영원한 문아 열려라',108:'구주 탄생 하심을',109:'고요한 밤 거룩한 밤',110:'공중에는 노래',111:'귀중한 보배합을',112:'그 맑고 환한 밤중에',113:'그 어린 주 예수',114:'그 어린 주 예수',115:'기쁘다 구주 오셨네',116:'동방 박사 세 사람',117:'만 백성 기뻐하여라',118:'영광 나라 천사들아',119:'옛날 임금 다윗성에',120:'오 베들레헴 작은 골',121:'우리 구주 나신 날',122:'참 반가운 신도여',123:'저 들밖에 한 밤중에',124:'한밤에 양을 치는 자',125:'천사들의 노래가',126:'천사 찬송하기를',127:'예수님의 귀한 사랑',128:'오 영원한 내 주 예수',129:'오 젊고 용감하신',130:'왕 되신 우리 주께',131:'주 예수 나귀 타고',132:'호산나 호산나',133:'어저께나 오늘이나',134:'감람산 깊은 밤중에',135:'갈보리 산위에',136:'거기 너 있었는가',137:'놀랍다 주님의 큰 은혜',138:'만왕의 왕 내 주께서',139:'생명의 주여 면류관',140:'성도들아 다 나아와',141:'웬말인가 날 위하여',142:'영화로신 주 예수의',143:'십자가에 달리신',144:'예수 나를 위하여',145:'오 거룩하신 주님',146:'저 멀리 푸른 언덕에',147:'주 달려 죽은 십자가',148:'주가 지신 십자가를',149:'기뻐 찬송하세',150:'무덤에 머물러',151:'다시 사신 구세주',152:'사망을 이긴 주',153:'오늘 다시 사심을',154:'예수 부활했으니',155:'주님께 영광',156:'싸움은 모두 끝나고',157:'즐겁도다 이 날',158:'하늘에 찬송이 들리던 그 날',159:'할렐루야 우리 예수',160:'할렐루야 할렐루야',161:'대속하신 구주께서',162:'신랑 되신 예수께서',163:'언제 주님 다시 오실는지',164:'오랫동안 고대하던',165:'저 산너머 먼동 튼다',166:'주 예수 믿는 자여',167:'주 예수의 강림이',168:'하나님의 나팔소리',169:'강물 같이 흐르는 기쁨',170:'구주여 크신 인애를',171:'비둘기 같이 온유한',172:'빈 들에 마른 풀같이',173:'불길 같은 성신여',174:'성령의 은사를',175:'성령이여 우리 찬송 부를 때',176:'영화로신 주 성령',177:'성령이여 강림하사',178:'은혜가 풍성한 하나님은',179:'이 기쁜 소식을',180:'무한하신 주 성령',181:'진실하신 주 성령',182:'구주의 십자가 보혈로',183:'나 속죄함을 받은 후',184:'나의 죄를 씻기는',185:'내 너를 위',186:'내 주의 보혈은',187:'너희 죄 흉악하나',188:'만세 반석 열리니',189:'마음에 가득한 의심을 깨치고',190:'샘물과 같은 보혈은',191:'양 아흔 아홉 마리는',192:'영원히 죽게 될 내 영혼',193:'예수 십자가에 흘린 피로써',194:'우리를 죄에서 구하시려',195:'이 세상의 모든 죄를',196:'날 구원하신 예수를',197:'이 세상 험하고',198:'정결하게 하는 샘이',199:'주 십자가를 지심으로',200:'주의 피로 이룬 샘물',201:'주의 확실한 약속의 말씀 듣고',202:'죄에서 자유를 얻게 함은',203:'나 행한 것으로',204:'예수로 나의 구주 삼고',205:'예수 앞에 나오면',206:'오랫동안 모든 죄 가운데 빠져서',207:'주 나에게 주시는',208:'주 예수 내맘에 들어와',209:'주의 말씀 받은 그 날',210:'내 죄 사함 받고서',211:'그 참혹한 십자가에',212:'너 성결키 위해',213:'먹 보다도 더 검은',214:'변찮는 주님의 사랑과',215:'이 죄인을 완전케 하옵시고',216:'아버지여 나의 맘을',217:'주님의 뜻을 이루소서',218:'주 예수님 내 맘에 오사',219:'주의 음성을 내가 들으니',220:'구주 예수 그리스도',221:'나 가난 복지 귀한 성에',222:'보아라 즐거운 우리집',223:'세상 모든 수고 끝나',224:'저 요단강 건너편에',225:'새 예루살렘 복된 집',226:'저 건너편 강 언덕에',227:'저 하늘 나라는',228:'저 좋은 낙원 이르니',229:'주 예수 다스리시는',230:'저 뵈는 본향 집',231:'주가 맡긴 모든 역사',232:'아름다운 본향',233:'황무지가 장미 꽃 같이',234:'나의 사랑하는 책',235:'달고 오묘한 그 말씀',236:'주 예수 크신 사랑',237:'저 높고 넓은 하늘이',238:'주님의 귀한 말씀은',239:'사랑의 하늘 아버지',240:'참 사람 되신 말씀',241:'하나님 아버지 주신 책은',242:'교회의 참된 터는',243:'귀하신 주님 계신 곳',244:'천지 주관하는 주님',245:'시온성과 같은 교회',246:'내 주의 나라와',247:'이 세상 풍파 심하고',248:'시온의 영광이 빛나는 아침',249:'주 사랑하는 자 다 찬송 할 때에',250:'아름다운 시온성아',251:'구주께서 부르되',252:'기쁜 소리 들리니',253:'구원으로 인도하는',254:'주 은총 입은 종들이',255:'너 시온아 이 소식 전파하라',256:'눈을 들어 하늘 보라',257:'듣는 사람마다 복음 전하여',258:'물 건너 생명줄 던지어라',259:'빛의 사자들이여',260:'새벽부터 우리',261:'어둔 밤 마음에 잠겨',262:'어둔 죄악 길에서',263:'예수 말씀 하시기를',264:'예수의 전한 복음',265:'옳은 길 따르라 의의 길',266:'왕의 명령 전달할 사자여',267:'주 날 불러 이르소서',268:'온 세상 위하여',269:'웬일인가 내 형제여',270:'우리가 지금은 나그네 되어도',271:'익은 곡식 거둘 자가',272:'인류는 하나 되게',273:'저 북방 얼음산과',274:'주 예수 넓은 사랑',275:'저 죽어 가는 자 다 구원하고',276:'하나님의 진리 등대',277:'흑암에 사는 백성들을 보라',278:'사랑하는 주님 앞에',279:'주 하나님의 사랑은',280:'생전에 우리가',281:'아무 흠도 없고',282:'유월절 때가 이르매',283:'주 앞에 성찬 받기 위하여',284:'주 예수 해변서',285:'오 나의 주님 친히 뵈오니',286:'성부님께 빕니다',287:'오늘 모여 찬송함은',288:'완전한 사랑',289:'고생과 수고가 다 지난 후',290:'괴로운 인생길 가는 몸이',291:'날빛보다 더 밝은 천국',292:'내 본향 가는 길',293:'천국에서 만나보자',294:'친애한 이 죽으니',295:'후일에 생명 그칠 때',296:'오늘까지 복과 은혜',297:'종소리 크게 울려라',298:'실로암 샘 물가에 핀',299:'예수께서 오실 때에',300:'예수께로 가면',301:'사랑의 하나님',302:'주님께 귀한 것 드려',303:'가슴마다 파도친다',304:'어머니의 넓은 사랑',305:'사철에 봄 바람 불어 잇고',306:'감사하는 성도여',307:'공중 나는 새를 보라',308:'넓은 들에 익은 곡식',309:'논밭에 오곡백과',310:'저 밭에 농부 나가',311:'산마다 불이 탄다 고운 단풍에',312:'묘한 세상 주시고',313:'갈 길을 밝히 보이시니',314:'기쁜 일이 있어 천국 종 치네',315:'돌아와 돌아와',316:'목마른 자들아',317:'어서 돌아오오',318:'예수가 우리를 부르는 소리',319:'온유한 주님의 음성',320:'주께서 문에 오셔서',321:'자비한 주께서 부르시네',322:'주께로 나오라',323:'주께로 한 걸음씩',324:'주님 찾아 오셨네',325:'주 예수 대문 밖에',326:'죄짐에 눌린 사람은',327:'죄짐을 지고서 곤하거든',328:'천성길을 버리고',329:'형제여 지체 말라',330:'고통의 멍에 벗으려고',331:'나 주를 멀리 떠났다',332:'나 행한 것 죄 뿐이니',333:'날마다 주와 버성겨',334:'아버지여 이 죄인을',335:'양떼를 떠나서',336:'여러 해 동안 주 떠나',337:'인애하신 구세주여',338:'천부여 의지 없어서',339:'큰 죄에 빠진 날 위해',340:'구주 예수 의지함이',341:'너 하나님께 이끌리어',342:'어려운 일 당할 때',343:'울어도 못하네',344:'이 눈에 아무 증거 아니 뵈어도',345:'주 하나님 늘 믿는자',346:'값비싼 향유를 주께 드린',347:'겸손히 주를 섬길 때',348:'나의 생명 드리니',349:'나 주의 도움 받고자',350:'나의 죄를 정케하사',351:'날 대속 하신 예수께',352:'내 임금 예수 내 주여',353:'내 주 예수 주신 은혜',354:'내 죄 속해 주신 주께',355:'부름 받아 나선 이 몸',356:'성자의 귀한 몸',357:'세상의 헛된 신을 버리고',358:'아침 해가 돋을 때',359:'예수가 함께 계시니',360:'예수 나를 오라 하네',361:'주의 주실 화평',362:'하나님이 말씀 하시기를',363:'내 모든 시험 무거운 짐을',364:'내 주를 가까이 하게 함은',365:'내 주의 지신 십자가',366:'어지러운 세상 중에',367:'십자가를 내가 지고',368:'내 죄를 회개하고',369:'네 맘과 정성을 다하여서',370:'어둔 밤 쉬 되리니',371:'삼천리 반도 금수강산',372:'나 맡은 본분은',373:'세상 모두 사랑 없어',374:'너 주의 사람아',375:'영광을 받으신 만유의 주여',376:'내 평생 소원 이것뿐',377:'예수 따라 가며',378:'이전에 주님을 내가 몰라',379:'주의 말씀 듣고서',380:'내 마음 주께 드리니',381:'충성하라 죽도록',382:'허락하신 새 땅에',383:'환난과 핍박 중에도',384:'내 주는 강한 성이요',385:'군기를 손에 높이 들고',386:'힘차게 일어나',387:'나는 예수 따라가는',388:'마귀들과 싸울지라',389:'믿는 사람들은 군병 같으니',390:'십자가 군병들아',391:'십자가 군병 되어서',392:'예수의 이름 힘 입어서',393:'우리들의 싸울것은',394:'주를 앙모하는 자',395:'너 시험을 당해',396:'주 예수 이름 소리 높여',397:'주 믿는 사람 일어나',398:'주 예수 우리 구하려',399:'주의 약속하신 말씀 위에서',400:'주의 진리 위해 십자가 군기',401:'천성을 향해 가는 성도들아',402:'행군 나팔 소리로',403:'나 위하여 십자가의',404:'그 크신 하나님의 사랑',405:'나 같은 죄인 살리신',406:'내 맘이 낙심되며',407:'그 영원하신 사랑은',408:'내 주 하나님 넓고 큰 은혜는',409:'목마른 내 영혼',410:'아 하나님의 은혜로',411:'예수 사랑 하심은',412:'우리는 주님을 늘 배반하나',413:'외롭게 사는 이 그 누군가',414:'주의 사랑 비췰 때에',415:'주 없이 살 수 없네',416:'하나님은 외 아들을',417:'큰 죄에 빠진 나를',418:'하나님 사랑은',419:'구주여 광풍이 일어',420:'그 누가 나의 괴롬 알며',421:'나는 갈 길 모르니',422:'나그네와 같은 내가',423:'나의 믿음 약할 때',424:'나의 생명 되신 주',425:'나 캄캄한 밤 죄의 길에',426:'날 위하여 날 위하여',427:'내가 매일 기쁘게',428:'내가 환난 당할때에',429:'내 갈길 멀고 밤은 깊은데',430:'내 선한 목자',431:'내 주여 뜻대로',432:'너 근심 걱정 말아라',433:'눈을 들어 산을 보니',434:'나의 갈 길 다가도록',435:'못 박혀 죽으신',436:'다정하신 목자 예수',437:'주 나의 목자 되시니',438:'예부터 도움 되시고',439:'만세반석 열린 곳에',440:'멀리 멀리 갔더니',441:'비 바람이 칠 때와',442:'선한 목자 되신 우리 주',443:'시험 받을 때에',444:'예수가 거느리시니',445:'오 나의 하나님',446:'오 놀라운 구세주',447:'오 신실 하신 주',448:'이 세상 끝날까지',449:'이 세상의 친구들',450:'자비하신 예수여',451:'전능하신 여호와여',452:'주는 귀한 보배',453:'주는 나를 기르시는 목자',454:'주 사랑 안에 살면',455:'주 안에 있는 나에게',456:'주와 같이 길 가는 것',457:'주의 곁에 있을 때',458:'주의 친절한 팔에 안기세',459:'지금까지 지내 온 것',460:'지금까지 지내 온 것',461:'캄캄한 밤 사나운 바람 불 때',462:'큰 물결이 설레는 어둔 바다',463:'험한 시험 물 속에서',464:'곤한 내 영혼 편히 쉴 곳과',465:'구주와 함께 나 죽었으니',466:'나 어느 곳에 있든지',467:'내게로 와서 쉬어라',468:'내 맘에 한 노래 있어',469:'내 영혼의 그윽히 깊은데서',470:'내 평생에 가는 길',471:'십자가 그늘 밑에',472:'영광스럽도다 참 된 평화는',473:'아 내 맘 속에',474:'이 세상에 근심된 일이 많고',475:'이 세상은 요란하나',476:'주 예수 넓은 품에',477:'바다에 놀이 치는 때',478:'주 날개 밑 내가 편안히 쉬네',479:'내가 깊은 곳에서',480:'기도하는 이 시간',481:'주여 복을 주시기를',482:'내 기도하는 그 시간',483:'너 예수께 조용히 나가',484:'마음 속에 근심 있는 사람',485:'어두운 내 눈 밝히사',486:'주 예수여 은혜를',487:'죄짐 맡은 우리 구주',488:'내 영혼에 햇빛 비치니',489:'세상 모든 풍파 너를 흔들어',490:'귀하신 주여 날 붙드사',491:'귀하신 친구 내게 계시니',492:'나의 영원하신 기업',493:'나 이제 주님의 새 생명 얻은 몸',494:'나 죄중에 헤메며',495:'내 영혼이 은총입어',496:'십자가로 가까이',497:'어디든지 예수 나를 이끌면',498:'은혜 구한 내게 은혜의 주님',499:'저 장미 꽃 위에 이슬',500:'주 음성 외에는',501:'주의 십자가 있는데',502:'태산을 넘어 험곡에 가도',503:'고요한 바다로',504:'예수 영광 버리사',505:'내 모든 소원 기도의 제목',506:'예수 더 알기 원함은',507:'주님의 마음을 본 받는 자',508:'주와 같이 되기를',509:'거친 세상에서 실패 하거든',510:'겟세마네 동산의',511:'내 구주 예수를 더욱 사랑',512:'내 주 되신 주를 참 사랑하고',513:'너희 마음에 슬픔이 가득 차도',514:'누가 주를 따라',515:'뜻없이 무릎 꿇는',516:'맘 가난한 사람',517:'생명 진리 은혜 되신',518:'신자 되기 원합니다',519:'십자가를 질 수 있나',520:'주의 귀한 말씀을',521:'어느 민족 누구게나',522:'주님이 가신 섬김의 길은',523:'나 형제를 늘 위해',524:'우리 다시 만날 때 까지',525:'주 믿는 형제들',526:'주 예수 안에 동서나',527:'큰 은혜로 묶어 주신',528:'주여 나의 병든 몸을',529:'큰 무리 주를 에워싼 중에',530:'네 병든 손 내밀라고',531:'때 저물어 날 이미 어두니',532:'구름 같은 이 세상',533:'내 맘의 주여 소망 되소서',534:'세월이 흘러 가는데',535:'어두운 후에 빛이 오며',536:'이 곤한 인생이',537:'엄동설한 지나가면',538:'예루살렘 금성아',539:'이 몸의 소망 무엔가',540:'이 세상 지나가고',541:'저 요단강 건너편에',542:'주여 지난 밤 내 꿈에',543:'저 높은 곳을 향하여',544:'잠시 세상에 내가 살면서',545:'하늘 가는 밝은 길이',546:'주 성전 안에 계시도다',547:'진리와 생명 되신 주',548:'주 기도문 영창',549:'우리 기도를',550:'주 너를 지키시고',551:'아 멘',552:'두 번 아 멘',553:'두 번 아 멘',554:'두 번 아 멘',555:'세 번 아 멘',556:'세 번 아 멘',557:'네 번 아 멘',558:'일곱 번 아 멘'};
var HYMN_TITLES_EN={1:'Praise God From Whom All Blessings Flow',2:'Glory be to the Father',3:'From All That Dwell Below the Skies',4:'Glory be to the Father',5:'To Father, Son and Holy Ghost',6:'To Father, Son and Holy Ghost',7:'To God the Only Wise',8:'Now to the King of Heaven',9:'Holy, Holy, Holy! Lord God Almighty',10:'Holy, Holy, Holy, Lord, God of Hosts',11:'Worship the Lord in the Beauty of Holiness',12:'Look, Ye Saints',13:'Joyful, Joyful, we Adore Thee',14:'Praise the Saviour, ye Who Know Him',15:'Awake, My soul, to joyful Lays',16:'I Know That my Redeemer Lives',17:'I Will Praise Thee',18:'Awake, My Soul',19:'Praise, My Soul, the King of Heaven',20:'Now Thank We all our God',21:'Praise to the Lord, the Almighty',22:'Jehovah, Let Me Now Adore Thee',23:'O For a Thousand Tongues',24:'O Come, Let Us Sing to the Lord',25:'Crown Him With Many Crowns',26:'Rejoice, the Lord is King',27:'Majestic Sweetness Sits Enthroned',28:'Come, Thou Fount of Every Blessing',29:'Come, Christians, Join to Sing',30:'The God of Abraham Praise',31:'O Worship the King all Glorious Above',32:'We Praise Thee, O God, our Redeemer, Creator',33:'All Creatures of Our God and King',34:'Come, Thou Almighty King',35:'I will Sing of my Redeemer',36:'All Hail the Power of Jesus\' Name',37:'All Hail the Power of Jesus\' Name',38:'Praise the Lord, His Glories Show',39:'We Gather Together to Ask the Lord\'s Blessing',40:'O, Lord my God! When I in Awesome Wonder',41:'Begin, My Tongue, Some Heavenly Theme',42:'O Splendor of God\'s Glory Bright',43:'We are Never, Never Weary',44:'Hark, ten Thousand Harps and Voices',45:'Ye Servants of God',46:'Praise Him, Praise Him',47:'God, be Merciful to Us',48:'Fairest Lord Jesus',49:'Sing on',50:'Great King of Glory',51:'Honor and Glory, Power and Salvation',52:'Jesus Shall Reign Wherever the Sun',53:'Heaven is Full of Your Glory',54:'God Himself is with Us',55:'Love Divine, all Loves Excelling',56:'Safely Through Another Week',57:'O Day of Rest and Gladness',58:'This is the Day the Lord Hath Made',59:'The Lord be With Us as Each Day',60:'Saviour, Again to Thy Dear Name',61:'Lord, Dismiss us With Thy Blessing',62:'Lord, Let us Now Depart in Peace',63:'Day is Dying in the West',64:'Ye that Have Spent the Silent Night',65:'O Light of Life, O Savior Dear',66:'Morning Hymns',67:'Sun of My Soul',68:'Father, We Praise Thee, Now the Night is Over',69:'We Give Thee but Thine Own',70:'All Things Come of Thee, O Lord',71:'All to Jesus I Surrender',72:'There\'ll be Showers of Blessing',73:'Unto the Hills Around Do I Lift Up',74:'O God, the Rock of Ages',75:'The Spacious Firmament on High',76:'Lord of all Being, Throned Afar',77:'God the Omnipotent!',78:'This is My Father\'s World',79:'God is Our Refuge Strong',80:'God Moves in a Mysterious Way',81:'How Sweet the Name of Jesus Sounds',82:'O Thou, in Whose Presence',83:'Is There Anyone Can Help Us',84:'In Fancy I Stood by the Shore, One Day',85:'Jesus, the Very Thought of Thee',86:'Oh, the Best Friend to Have is Jesus',87:'My Lord Has Garments so Wondrous Fine',88:'I Have Found a Friend in Jesus',89:'Jesus, Rose of Sharon',90:'I Lay my Sins on Jesus',91:'Take the Name of Jesus With You',92:'Sing Christ, the Triumph of Light',93:'Jesus is All the World to Me',94:'Who, You Ask Me, is My Jesus',95:'The Whole World was Lost in the Darkness of Sin',96:'The Lord of Glory, the Light of Earth',97:'There\'s one Above All Earthly Friends',98:'I\'ve Found a Friend',99:'Christ Has for Sin Atonement Made',100:'Chief of Sinners Though I Be',101:'There is no Name so Sweet',102:'I\'d Rather Have Jesus',103:'Shepherd of Tender Youth',104:'O Come, O Come, Emmanuel',105:'Come, Thou Longexpected Jesus',106:'Lo, How a Rose Ever Blooming',107:'Lift up Your Heads, Ye Mighty Gates',108:'Christ is Born, the Angels Sing',109:'Silent Night, Holy Night',110:'There\'s a Song in the Air',111:'Bringing Our All',112:'It Came Upon the Midnight Clear',113:'Away in a Manger',114:'Away in a Manger',115:'Joy to the World',116:'We Three Kings of Orient Are',117:'God Rest you Merry, Gentlemen',118:'Angels, From the Realms of Glory',119:'Once in Royal David\'s City',120:'O Little Town of Bethlehem',121:'On the Day of Jesus\' Birth',122:'O Come, all ye Faithful',123:'The First Noel, the Angel Did Say',124:'While Shepherds Watched Their Flocks',125:'Angels We Have Heard on High',126:'Hark! the Herald Angels Sing',127:'Jesus\' Love is, oh, so Precious',128:'O Thou Eternal Christ of God',129:'O Young and Fearless Prophet',130:'All Glory, Laud and Honor',131:'When His Salvation Bringing',132:'Hosanna, Loud Hosanna',133:'Oh, How Sweet the Glorious Message',134:'\'Tis Midnight, and on Olive\'s Brow',135:'On a Hill far Away',136:'Were You There When They Crucified my Lord',137:'Marvelous Grace of Loving Lord',138:'Alas! and Did My Saviour Bleed',139:'King of My Life, I Crown Thee Now',140:'O Come and Mourn With Me a While',141:'Alas! and Did my Saviour Bleed',142:'On Calvary\'s Brow my Saviour Died',143:'Throned Upon the Awful Tree',144:'Jesus Shed His Blood for Me',145:'O Sacred Head, Now Wounded',146:'There is a Green Hill far Away',147:'When I Survey the Wondrous Cross',148:'In the Cross of Christ I Glory',149:'Rejoice and be Glad',150:'Low in the Grave He Lay',151:'I Serve a Risen Saviour',152:'The Lord is Risen Indeed',153:'Christ, the Lord, is Risen Again',154:'Christ, the Lord, is Risen Today',155:'Thine is the Glory',156:'The Strife is Over, the Battle Done',157:'Welcome, Happy Morning',158:'One Day When Heaven Was Filled With His Praises',159:'Hallelujah, He is Risen',160:'O Sons and Daughters, Let Us Sing',161:'Lo! He Comes, With Clouds Descending',162:'Will Our Lamps be Filled and Ready',163:'When Jesus Comes to Reward',164:'I am Watching for the Coming',165:'Over the Distant Mountain Breaking',166:'Rejoice All Ye Believers',167:'O Turn Ye',168:'What the Trumpet of the Lord Shall Sound',169:'Joys are flowing Like a River',170:'Jesus, Thine all Victorious Love',171:'Come, Gracious Spirit, Heavenly Dove',172:'There Shall be Showers of Blessing',173:'Come, Thou Burning Spirit, Come',174:'Breathe on me, Breath of God',175:'Holy Spirit, Hear Us',176:'Holy Ghost, With Light Divine',177:'Hover Over me, Holy Spirit',178:'God Whose Grace Overflows',179:'Oh, Spread the Tidings \'round',180:'Come to Our Poor Nature\'s Night',181:'Holy Spirit, Faithful Guide',182:'Down at the Cross Where my Saviour Died',183:'I Have a Song I Love to Sing',184:'What Can Wash Away my Sin',185:'I Gave My Life for Thee',186:'I Hear Thy Welcome Voice',187:'Tho\' Your Sins be as Scarlet',188:'Rock of Ages, Cleft for Me',189:'I Can Sing Now the Song',190:'There is a Fountain Filled With Blood',191:'There Were Ninety and Nine',192:'There Was One Who Was Willing to Die',193:'Have You Been to Jesus',194:'Glory to Jesus, Who Died',195:'Blessed Be the Fountain of Blood',196:'Of Him Who Did Salvation Bring',197:'I Hear the Saviour Say',198:'When I Saw the Cleansing Fountain',199:'Christ, Our Redeemer',200:'O Now I See the Cleansing Wave',201:'\'Tis the Promise of God',202:'Would You be Free From Your Burden of Sin',203:'Not What these Hands Have Done',204:'Blessed Assurance, Jesus is Mine',205:'\'Tis for You and Me',206:'The Abundant Love of Jesus',207:'I Stand all Amazed',208:'What a Wonderful Change',209:'O Happy Day, That Fixed My Choice',210:'Everything is Changed',211:'The Precious Blood of Jesus',212:'Take Time to be Holy',213:'Sins of Years are Washed Away',214:'Let us Sing of His Love',215:'Lord Jesus, I Long to be Perfectly Whole',216:'Take My Heart, O Father',217:'Have Thine own way, Lord',218:'Come Into My Heart, Blessed Jesus',219:'I am Thine, O Lord, I Have Heard Thy Voice',220:'There is a Gate Where Angels Wait',221:'I\'ve Cast My Heavy Burdens Down',222:'O, Think of the Home Over There',223:'When the Toils of Life Are Over',224:'Face to Face with Christ',225:'Jerusalem my Happy Home',226:'There\'s a Land Beyond the River',227:'Lord of the Worlds Above',228:'I\'ve Reached the Land of Corn and Wine',229:'O Holy City, Seen of John',230:'One Sweetly Solemn Thought',231:'When My Life Work is Ended',232:'I Will Sing You a Song of That Beautiful Land',233:'We Shall See the Desert as the Rose',234:'There is a Dear And Precious Book',235:'Sing Them Over Again to Me',236:'Tell Me the Old, Old Story',237:'The Heavens Declare Thy Glory, Lord',238:'Lamp of Our Feet, Whereby We Trace',239:'Father of Mercies in Thy Word',240:'O Word of God Incarnate',241:'I am so Glad That Our Father in Heaven',242:'The Church\'s One Foundation',243:'Jesus, Wherever Thy People Meet',244:'Temples God',245:'Glorious Things of Thee are Spoken',246:'I Love Thy Kingdom, Lord',247:'From Every Stormy Wind that Blows',248:'Hail to the Brightness of Zion\'s Glad Morning',249:'Come, We That Love the Lord',250:'Open Now Thy Gates of Beauty',251:'Come, Come to the Saviour',252:'We Have Heard the Joyful Sound',253:'Strait is the Gate to Salvation',254:'Send Thou, O Lord, to Every Place',255:'O Zion, Haste',256:'Lift Your Eyes And Look to Heaven',257:'Whosoever Heareth, Shout, Shout the Sound',258:'Throw out the Life Line',259:'Heralds of the Light, Be Swift',260:'Sowing in the Morning',261:'Unto Hearts in deep Night Pining',262:'Life at Best is Very Brief',263:'Hark, the Voice of Jesus Calling',264:'The Morning Light is Breaking',265:'We\'ve a Story to Tell to the Nations',266:'Heralds of Christ, Who Bear the King\'s Commands',267:'Lord, Speak to Me',268:'Christ for the Whole Wide World',269:'Why not Believe, My Brother? Tell',270:'I am a Stranger Here',271:'Here am I, Send Me',272:'Humankind, the Work of God',273:'From Greenland\'s Icy Mountains',274:'I Love to Tell the Story',275:'Rescue the Perishing',276:'Brightly Beams Our Father\'s Mercy',277:'Far, Far Away in Heathen Darkness Dwelling',278:'In One Fraternal Bond of Love',279:'Our Father, Thy Dear Name Doth Show',280:'And are We yet Alive',281:'O Thou, the Lamb of God',282:'\'Twas on That Night When Doomed to Know',283:'Not Worthy, Lord, to Gather',284:'Break Thou the Bread of Life',285:'Here, O my Lord, I See Thee Face to Face',286:'Here, O Father, This Our Prayer',287:'Joy and Praise This Day Confessing',288:'O Perfect Love, all Human Thought Transcending',289:'When all My Labours and Trials are Over',290:'I\'m but a Stranger Here',291:'There\'s a Land that is Fairer Than Day',292:'The Blessed Land',293:'I Will Meet You in the Morning',294:'As We Mourn a Dear One Gone',295:'Some Day the Silver Cord Will Break',296:'At Thy Feet, Our God and Father',297:'Ring out the Old, Ring in the New',298:'By Cool Siloam\'s Shady Rill',299:'When He Cometh',300:'If I Come to Jesus',301:'A Little Child May Know',302:'Give of Your Best to the Master',303:'Every Heart Beats Like the Ocean',304:'Precious Love, the Love of Mother',305:'All Year in Our Home the Spring Breezes Blow',306:'Come, Ye Thankful People, Come',307:'See the Birds That Fly the Heavens',308:'Far and Near the Fields are Teeming',309:'Sing to the Lord of Harvest',310:'We Plow the Fields, and Scatter',311:'Every Hill Seems to Be Aflame',312:'For the Beauty of the Earth',313:'Come to the Saviour, Make no Delay',314:'Ring the Bells of Heaven',315:'Come Home! Come Home',316:'Come, Ye Disconsolate',317:'O, Come Home',318:'Softly and Tenderly Jesus is Calling',319:'Patiently, Tenderly Pleading',320:'Behold! a Stranger at the Door',321:'Jesus is Tenderly Calling Thee Home',322:'Come to the Saviour Now',323:'Only a Step to Jesus',324:'Christ, thy Lord is Waiting Now',325:'O Jesus, Thou Art Standing',326:'Come, Every Soul by Sin Oppressed',327:'If You are Tired of the Load of Your Sin',328:'Sinners Jesus Will Receive',329:'Why Do You Wait, Dear Brother',330:'Out of My Bondage, Sorrow and Night',331:'I\'ve Wandered Far Away From God',332:'One Thing I of the Lord Desire',333:'I Grieved My Lord From Day to Day',334:'Take Me, Oh, My Father, Take Me',335:'I Was a Wandering sheep',336:'Far From the Lord I Wandered Long',337:'Pass Me not, O Gentle Saviour',338:'Father, I Stretch My Hands to Thee',339:'Just as I am, Without One Plea',340:'\'Tis so Sweet to Trust in Jesus',341:'If Thou but Suffer God to Guide Thee',342:'Simply Trusting Every day',343:'Weeping Will Not Save Me',344:'Down in the Valley Where the Mists of Doubt Arise',345:'Who Trusts in God',346:'Master, no Offering Costly and Sweet',347:'O Master, Let Me Walk With Thee',348:'Take My Life, and Let It Be',349:'Jesus, My Lord to Thee I Cry',350:'How I Praise Thee, Precious Saviour',351:'My Life, My Love I Give to Thee',352:'Jesus, My King',353:'Lord Take My All',354:'All for Jesus',355:'Called of God, We Honor the Call',356:'Saviour! Thy Dying Love',357:'Gather Us in, Thou Love',358:'When the Morning Breaks Anew',359:'Living for Jesus',360:'I Can Hear My Saviour Calling',361:'You Have Longed for Sweet Peace',362:'Give Me Thy Heart',363:'I Must Tell Jesus',364:'Nearer, My God, to Thee',365:'Must Jesus Bear the Cross Alone',366:'Jesus Calls Us, Over the Tumult',367:'Jesus, I My Cross Have Taken',368:'Serving the Lord',369:'You Shall Love God, Your Lord',370:'Work, for the Night is Coming',371:'River and Mountain, Streams Flowing Clear',372:'A Charge to Keep I Have',373:'Do you Know the World is Dying',374:'Rise up, O Men of God',375:'Truehearted, Wholehearted',376:'My One Wish, Lord, is This Alone',377:'When We Walk With the Lord',378:'Once Knowing not the Lord for From His Face',379:'Those Who Hear and Do the Word',380:'My God, Accept my Heart this Day',381:'Be Thou Faithful unto Death',382:'We are Bound for Canaan Land',383:'Faith of Our Fathers',384:'A Mighty Fortress is Our God',385:'Conquering Now and Still to Conquer',386:'March on, O Soul, with Strength',387:'Am I a Soldier of the Cross',388:'Up and Fight Against the Devil',389:'Onward, Christian Soldiers',390:'Stand Up for Jesus',391:'Am I a Soldier of the Cross',392:'In Jesus\' Name is Power of Conquest',393:'March We Onward',394:'They that Wait upon the Lord',395:'Yield not to Temptation',396:'War of the Soul',397:'Encamped Along the Hills of Light',398:'The Son of God Goes Forth to War',399:'Standing on the Promises',400:'There\'s a Royal Banner',401:'Go Forward',402:'Bugle Calls are Ringing Out',403:'My Life Flows Rich in Love and Grace',404:'The Love of God is Greater Far',405:'Amazing Grace! How Sweet the Sound!',406:'Just When I am Disheartened',407:'Immortal Love, Forever Full',408:'The Mercy of God is an Ocean Divine',409:'My Soul Today is Thirsting',410:'I Know not Why God\'s Wondrous Grace',411:'Jesus Loves Me, This I Know',412:'I Have a Saviour He\'s Pleading in Glory',413:'Somebody Loves You',414:'Jesus Comes With Power to Gladden',415:'I Could Not Do Without Thee',416:'God Gave His Only Begotten Son',417:'Of Jesus\' Love that Sought Me',418:'O Love of God Most Full',419:'Master, the Tempest is Raging',420:'Nobody Knows the Trouble I\'ve Seen',421:'Jesus, Saviour, Pilot Me',422:'Guide Me, O Thou Great Jehovah',423:'When I Fear My Faith Will Fail',424:'Saviour, More Than Life to Me',425:'I Wandered in the Shades',426:'Yes, For Me, For Me',427:'I\'m Rejoicing Night and Day',428:'The Lord Hear Thee',429:'Lead, Kindly Light',430:'Tell Me, My Savior',431:'My Jesus, as Thou Wilt',432:'Be not Dismayed Whatever Betide',433:'To the Hills I Lift Mine Eyes',434:'All the Way My Saviour Leads Me',435:'My Faith Looks up to Thee',436:'Jesus, Tender Shepherd, Hear Me',437:'The Lord\'s My Shepherd',438:'O God, Our Help in Ages Past',439:'In the Rifted Rock I\'m Resting',440:'I Have Wandered Far Indeed',441:'Jesus, Lover of My Soul',442:'Saviour, Like a Shepherd Lead Us',443:'In the Hour of Trial',444:'He Leadeth Me: O Blessed Thought',445:'O God, Forsake Me Not',446:'A Wonderful Saviour is Jesus My Lord',447:'Great is Thy Faithfulness',448:'O Jesus, I Have Promised',449:'Earthly Friends May Prove Untrue',450:'God Be Merciful to Me',451:'Guide me, O Thou Great Jehovah',452:'Jesus, Priceless Treasure',453:'While the Lord is My Shepherd',454:'In Heavenly Love Abiding',455:'The Trusting Heart to Jesus Clings',456:'\'Tis so Sweet to Walk With Jesus',457:'Saviour, Lead Me, Lest I Stray',458:'What a Fellowship, What a Joy Divine',459:'God\'s Great Grace it is has Brought Us',460:'God\'s Great Grace it is has Brought Us',461:'Every Thing Dark! Bleak, Black',462:'With Christ as My Pilot',463:'Jesus, Hide Me',464:'I Have Found Sweet Rest',465:'Dying with Jesus',466:'I Can not Tell thee Whence it Came',467:'I Heard the Voice of Jesus Say',468:'There Comes to My Heart',469:'Far Away in the Depths of My Spirit',470:'When Peace, Like a River, Attendeth My Way',471:'Beneath the Cross of Jesus',472:'Like a River Glorious',473:'There\'s a Peace in My Heart',474:'My Soul in Sad Exile',475:'O Blessed Life the Heart at Rest',476:'Safe in the Arms of Jesus',477:'Fierce Raged the Tempest Over the Deep',478:'Under His Wings I Am Safely Abiding',479:'From the Depths, O Lord, I Cry',480:'\'Tis the Blessed Hour of Prayer',481:'Lord, I Hear of Showers of Blessing',482:'Sweet Hour of Prayer',483:'Go, Carry thy Burden to Jesus',484:'Are You Weary',485:'Open My Eyes, that I May See',486:'Heart Longings',487:'What a Friend We Have in Jesus',488:'There\'s Sunshine in My Soul Today',489:'When Upon Life\'s Billows',490:'Nearer, Still Nearer',491:'I Have a Friend',492:'Thou, My Everlasting Portion',493:'Lately the Life of Christ',494:'I Know That My Saviour Will Never Forsake',495:'Since Christ My Soul From Sin Set Free',496:'Jesus, Keep Me Near the Cross',497:'Anywhere With Jesus I Can Safely Go',498:'Once it Was the Blessing',499:'I Come to the Garden Alone',500:'I Need Thee Every Hour',501:'Nearer the Cross',502:'Walking in Sunlight all of My Journey',503:'If, on a Quiet Sea',504:'Looking Unto Jesus',505:'Oh, to be like Thee',506:'More About Jesus Would I Know',507:'We Shall be Like Him',508:'More Like Jesus Would I Be',509:'Have you Failed in Your Plan',510:'Go to Dark Gethsemane',511:'More Love to Thee, O Christ',512:'My Jesus, I Love Thee',513:'Tho\' Your Heart May be Heavy',514:'Who is on the Lord\'s Side',515:'Not in Dumb Resignation',516:'Blest are the Poor in Heart',517:'Son of God, Eternal Saviour',518:'Lord, I Want to be a Christian',519:'\'Are Ye Able,\' Said the Master',520:'Saviour, Teach Me, Day by Day',521:'Once to Every Man and Nation',522:'We Thank Thee, Lord',523:'I Would Be True',524:'God be With You till We Meet Again',525:'Blest be the Tie That Binds',526:'In Christ There is no East or West',527:'All Praise to Our Redeeming Lord',528:'Heal Me Now, My Saviour',529:'She Only Touched the Hem of His Garment',530:'When Christ of Old With Healing Power',531:'Abide With Me',532:'Lord, I Care not for Riches',533:'Be Thou My Vision',534:'My Days are Gliding Swiftly By',535:'Light After Darkness',536:'O Where shall Rest be Found',537:'Beyond the Winter\'s Cold',538:'Jerusalem the Golden',539:'My Hope is Built on Nothing Less',540:'The Sands of Time are Sinking',541:'Face to Face With Christ My Saviour',542:'There\'s a Dream That I Dream',543:'I\'m Pressing on the Upward Way',544:'Just a Few More Days',545:'The Bright, Heavenly Way',546:'The Lord is in His Holy Temple',547:'Spirit of Truth, of Life, of Power',548:'Our Father Who Art in Heaven',549:'Hear Our Prayer, O Lord',550:'The Lord Bless You and Keep You',551:'Amen',552:'Two fold Amen',553:'Two fold Amen',554:'Two fold Amen',555:'Three fold Amen',556:'Three fold Amen',557:'Four fold Amen',558:'Seven fold Amen'};
var HYMN_TITLES = HYMN_TITLES_KO; // active title map (ko/en)
function _hymGetTitleLang(){ return (typeof I18N!=='undefined'&&I18N.getLang()==='en')?'en':'ko'; }
function _hymnTitle(id){ var m=(_hym.titleLang==='en')?HYMN_TITLES_EN:HYMN_TITLES_KO; return m[id]||('Hymn '+id); }
function _hymnLabel(id){ return _hymnTitle(id) ? id+'. '+_hymnTitle(id) : 'Hymn '+id; }
function _hymnHasMp3(id){ return HYMN_MP3_SET.has(id); }
function _hymnHasSheet(id){ return HYMN_SHEET_SET.has(id); }
var _HYMN_STORAGE_BASE = 'https://firebasestorage.googleapis.com/v0/b/tyrannus-kjb1611.firebasestorage.app/o/';
function _hymnMp3Url(id){ return _HYMN_STORAGE_BASE + 'hymns%2Fmp3%2F'+id+'.mp3?alt=media'; }
function _hymnSheetUrl(id){ return _HYMN_STORAGE_BASE + 'hymns%2Fsheet%2F'+id+'.png?alt=media'; }

/* ── Section 2: Runtime State ── */
var _hym = {
  inited: false,
  spView: 'list',        // side panel view: 'list' | 'playlists' | 'playlist-detail'
  detailOpen: false,      // overlay detail open?
  titleLang: 'ko',        // 'ko' | 'en' — hymn title language
  filter: 'all',
  search: '',
  selectedId: null,
  audio: null,
  playing: false,
  currentId: null,
  duration: 0,
  currentTime: 0,
  queue: [],
  queueIdx: -1,
  queueName: '',
  repeat: 'none',
  shuffle: false,
  zoom: 1,
  addMenuId: null,
  seeking: false,
  currentPlaylistId: null,
  // virtual scroll state
  _vsIds: [],          // current filtered id list
  _vsItemH: 38,        // item height in px
  _vsBuffer: 10,       // extra items above/below viewport
  _vsScrollBound: false,
  _vsDebounce: null,
};

/* ── Section 3: Init ── */
function _hymInit(){
  if(_hym.inited) return;
  _hym.inited = true;
  _hym.titleLang = _hymGetTitleLang();
  _hym.audio = document.getElementById('hymAudio');
  if(!_hym.audio) return;
  var a = _hym.audio;
  a.addEventListener('timeupdate', _hymOnTimeUpdate);
  a.addEventListener('ended', _hymOnEnded);
  a.addEventListener('loadedmetadata', function(){ _hym.duration = a.duration; _hymUpdateAllPlayers(); });
  a.addEventListener('play', function(){ _hym.playing = true; _hymUpdatePlayIcons(); });
  a.addEventListener('pause', function(){ _hym.playing = false; _hymUpdatePlayIcons(); });
  if(S.hymnLastPlayed && (HYMN_MP3_SET.has(S.hymnLastPlayed) || HYMN_SHEET_SET.has(S.hymnLastPlayed))){
    _hym.currentId = S.hymnLastPlayed;
  }
  // listen for locale changes (settings → language switch)
  if(typeof EventBus!=='undefined') EventBus.on('locale:changed', function(){
    _hym.titleLang = _hymGetTitleLang();
    var btn = document.getElementById('hymLangBtn');
    if(btn) btn.textContent = _hym.titleLang==='ko'?'한':'EN';
    if(_hym.spView==='list') _hymRenderList();
    _hymUpdateAllPlayers();
  });
}

// Called from _initSection('hymns') in icon-rail.js
function _hymInitSidePanel(){
  _hymInit();
  // sync title lang with site language
  _hym.titleLang = _hymGetTitleLang();
  var btn = document.getElementById('hymLangBtn');
  if(btn) btn.textContent = _hym.titleLang === 'ko' ? '한' : 'EN';
  _hymShowSpView(_hym.spView);
  if(_hym.currentId) _hymShowSpPlayer();
}

/* ── Section 4: Side Panel View Management ── */
function _hymShowSpView(name){
  _hym.spView = name;
  var toolbar = document.getElementById('hymToolbar');
  ['hymViewList','hymViewPlaylists','hymViewPlaylistDetail'].forEach(function(id){
    var e = document.getElementById(id);
    if(e) e.style.display = 'none';
  });
  var viewMap = {list:'hymViewList', playlists:'hymViewPlaylists', 'playlist-detail':'hymViewPlaylistDetail'};
  var v = document.getElementById(viewMap[name]);
  if(v) v.style.display = '';
  // toolbar visibility
  if(toolbar) toolbar.style.display = (name === 'list') ? '' : 'none';
  if(name === 'list') _hymRenderList();
  else if(name === 'playlists') _hymRenderPlaylists();
  else if(name === 'playlist-detail') _hymRenderPlaylistDetail(_hym.currentPlaylistId);
}

/* ── Detail overlay (bibleScroll area) ── */
function _hymOpenDetail(id){
  _hym.selectedId = id;
  _hym.detailOpen = true;
  _hym.zoom = 1;
  // show overlay, hide bibleScroll + top bars for full-height
  var overlay = document.getElementById('hymnsOverlay');
  var scroll = document.getElementById('bibleScroll');
  var tabBar = document.getElementById('bibleTabBar');
  var viewBar = document.getElementById('bibleViewBar');
  if(overlay) overlay.style.display = 'flex';
  if(scroll) scroll.style.display = 'none';
  if(tabBar) tabBar.style.display = 'none';
  if(viewBar) viewBar.style.display = 'none';
  // update overlay header
  var title = document.getElementById('hymTitle');
  if(title) title.textContent = _hymnLabel(id);
  _hymRenderDetail(id);
  _hymShowGlobalPlayer();
  // update fav button in header
  _hymUpdateHdrFav(id);
}

function _hymCloseDetail(){
  _hym.detailOpen = false;
  var overlay = document.getElementById('hymnsOverlay');
  var scroll = document.getElementById('bibleScroll');
  var tabBar = document.getElementById('bibleTabBar');
  var viewBar = document.getElementById('bibleViewBar');
  if(overlay) overlay.style.display = 'none';
  if(scroll) scroll.style.display = '';
  if(tabBar) tabBar.style.display = '';
  if(viewBar) viewBar.style.display = '';
  _hymShowGlobalPlayer();
}

/* ── Section 5: List View (side panel) — virtual scroll ── */
function _hymRenderList(){
  var cont = document.getElementById('hymViewList');
  if(!cont) return;
  _hym._vsIds = _hymFilteredIds();
  if(_hym._vsIds.length === 0){
    cont.innerHTML = '<div class="hym-empty"><i class="fa fa-'+ (_hym.filter==='fav'?'heart':'search') +'"></i>'+(_hym.filter==='fav'?'\uC990\uACA8\uCC3E\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4':'\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4')+'</div>';
    return;
  }
  var totalH = _hym._vsIds.length * _hym._vsItemH;
  cont.innerHTML = '<div id="hymVsPad" style="height:'+totalH+'px;position:relative"><div id="hymVsSlice" style="position:absolute;left:0;right:0"></div></div>';
  // bind scroll once
  if(!_hym._vsScrollBound){
    var scroller = document.getElementById('hymContent');
    if(scroller){
      scroller.addEventListener('scroll', _hymVsOnScroll, {passive:true});
      _hym._vsScrollBound = true;
    }
  }
  _hymVsPaint();
}

function _hymVsOnScroll(){
  if(_hym._vsDebounce) return;
  _hym._vsDebounce = requestAnimationFrame(function(){
    _hym._vsDebounce = null;
    _hymVsPaint();
  });
}

function _hymVsPaint(){
  var slice = document.getElementById('hymVsSlice');
  if(!slice) return;
  var scroller = document.getElementById('hymContent');
  if(!scroller) return;
  var ids = _hym._vsIds;
  var ih = _hym._vsItemH;
  var buf = _hym._vsBuffer;
  var scrollTop = scroller.scrollTop;
  var viewH = scroller.clientHeight;
  var first = Math.max(0, Math.floor(scrollTop / ih) - buf);
  var last = Math.min(ids.length - 1, Math.ceil((scrollTop + viewH) / ih) + buf);
  var h = '';
  for(var i = first; i <= last; i++){
    var id = ids[i];
    var isFav = S.hymnFav.has(id);
    var hasMp3 = _hymnHasMp3(id);
    var isPlaying = _hym.currentId === id && _hym.playing;
    h += '<div class="hym-list-item'+(isPlaying?' hym-playing':'')+'" data-id="'+id+'" onclick="_hymOpenDetail('+id+')" style="position:absolute;top:'+(i*ih)+'px;left:0;right:0;height:'+ih+'px">';
    h += '<span class="hym-list-num">'+id+'</span>';
    h += '<span class="hym-list-title">'+_hymnTitle(id)+'</span>';
    h += '<div class="hym-list-icons">';
    if(hasMp3) h += '<button class="hym-play-btn" onclick="_hymQuickPlay('+id+',event)" title="\uC7AC\uC0DD"><i class="fa fa-play"></i></button>';
    h += '<button class="hym-add-pl-btn" onclick="_hymShowAddMenu('+id+',event)" title="\uC7AC\uC0DD\uBAA9\uB85D\uC5D0 \uCD94\uAC00"><i class="fa fa-plus"></i></button>';
    h += '<button class="hym-fav-btn'+(isFav?' hym-fav-on':'')+'" onclick="_hymToggleFav('+id+',event)" title="\uC990\uACA8\uCC3E\uAE30">';
    h += '<i class="fa'+(isFav?'s':'r')+' fa-heart"></i></button>';
    h += '</div></div>';
  }
  slice.innerHTML = h;
}

function _hymFilteredIds(){
  var ids;
  if(_hym.filter === 'fav'){
    ids = HYMN_ALL_IDS.filter(function(id){ return S.hymnFav.has(id); });
  } else {
    ids = HYMN_ALL_IDS;
  }
  if(_hym.search){
    var q = _hym.search.trim().toLowerCase();
    if(q) ids = ids.filter(function(id){
      if(String(id).indexOf(q) !== -1) return true;
      var ko = HYMN_TITLES_KO[id];
      if(ko && ko.toLowerCase().indexOf(q) !== -1) return true;
      var en = HYMN_TITLES_EN[id];
      return en && en.toLowerCase().indexOf(q) !== -1;
    });
  }
  return ids;
}

var _hymSearchTimer = null;
function _hymOnSearch(val){
  _hym.search = val;
  if(_hymSearchTimer) clearTimeout(_hymSearchTimer);
  _hymSearchTimer = setTimeout(function(){
    var scroller = document.getElementById('hymContent');
    if(scroller) scroller.scrollTop = 0;
    if(_hym.spView === 'list') _hymRenderList();
  }, 150);
}

function _hymSetFilter(f){
  if(f === 'playlists'){
    _hym.filter = f;
    _hymShowSpView('playlists');
    return;
  }
  _hym.filter = f;
  var scroller = document.getElementById('hymContent');
  if(scroller) scroller.scrollTop = 0;
  if(_hym.spView !== 'list') _hymShowSpView('list');
  else _hymRenderList();
  // update filter button active states
  document.querySelectorAll('.hym-filter-btn').forEach(function(b){
    b.classList.toggle('hym-filter-active', b.dataset.filter === _hym.filter);
  });
}

function _hymToggleFav(id, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  if(S.hymnFav.has(id)) S.hymnFav.delete(id);
  else S.hymnFav.add(id);
  persist();
  if(_hym.spView === 'list'){
    if(_hym.filter === 'fav') _hymRenderList(); // list changes — rebuild
    else _hymVsPaint(); // just repaint visible slice
  }
  if(_hym.detailOpen && _hym.selectedId === id) _hymUpdateHdrFav(id);
}

function _hymQuickPlay(id, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  if(!_hymnHasMp3(id)) return;
  _hymSetQueue([id], 0);
}

/* ── Section 6: Detail View (overlay in bibleScroll area) ── */
function _hymRenderDetail(id){
  var cont = document.getElementById('hymViewDetail');
  if(!cont || !id) return;
  var hasSheet = _hymnHasSheet(id);
  var hasMp3 = _hymnHasMp3(id);
  var h = '';
  // sheet (no header/zoom — title+fav are in the overlay header)
  if(hasSheet){
    h += '<div class="hym-sheet-wrap">';
    h += '<img class="hym-sheet-img" id="hymSheetImg" src="'+_hymnSheetUrl(id)+'" alt="'+_hymnLabel(id)+' \uC545\uBCF4" style="transform:scale('+_hym.zoom+')" onerror="this.parentNode.innerHTML=\'<div class=hym-no-sheet><i class=&quot;fa fa-image&quot;></i>\uC545\uBCF4\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4</div>\'">';
    h += '</div>';
  } else {
    h += '<div class="hym-sheet-wrap"><div class="hym-no-sheet"><i class="fa fa-image"></i>\uC545\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4</div></div>';
  }
  // player
  if(hasMp3){
    var isThisPlaying = _hym.currentId === id && _hym.playing;
    h += '<div class="hym-detail-player" id="hymDetailPlayer">';
    h += '<div class="hym-dp-controls">';
    h += '<button class="hym-dp-btn'+ (_hym.shuffle?' hym-dp-active':'') +'" onclick="_hymToggleShuffle()" title="\uC154\uD50C"><i class="fa fa-random"></i></button>';
    h += '<button class="hym-dp-btn" onclick="_hymPrev()" title="\uC774\uC804"><i class="fa fa-step-backward"></i></button>';
    h += '<button class="hym-dp-btn hym-dp-play" id="hymDpPlayBtn" onclick="_hymPlayThis('+id+')" title="\uC7AC\uC0DD"><i class="fa fa-'+(isThisPlaying?'pause':'play')+'"></i></button>';
    h += '<button class="hym-dp-btn" onclick="_hymNext()" title="\uB2E4\uC74C"><i class="fa fa-step-forward"></i></button>';
    h += '<button class="hym-dp-btn'+ (_hym.repeat!=='none'?' hym-dp-active':'') +'" onclick="_hymToggleRepeat()" title="\uBC18\uBCF5"><i class="fa fa-redo"></i>'+ (_hym.repeat==='one'?'<small style="font-size:8px;position:absolute;margin-top:8px">1</small>':'') +'</button>';
    h += '</div>';
    h += '<div class="hym-dp-seek">';
    h += '<span class="hym-dp-time" id="hymDpTimeCur">'+_hymFormatTime(_hym.currentId===id?_hym.currentTime:0)+'</span>';
    h += '<div class="hym-dp-track" id="hymDpTrack" onmousedown="_hymSeekStart(event,\'detail\')" ontouchstart="_hymSeekStart(event,\'detail\')">';
    var pct = (_hym.currentId===id && _hym.duration>0) ? (_hym.currentTime/_hym.duration*100) : 0;
    h += '<div class="hym-dp-fill" id="hymDpFill" style="width:'+pct+'%"></div>';
    h += '</div>';
    h += '<span class="hym-dp-time" id="hymDpTimeDur">'+_hymFormatTime(_hym.currentId===id?_hym.duration:0)+'</span>';
    h += '</div></div>';
  } else {
    h += '<div class="hym-no-audio"><i class="fa fa-volume-mute"></i> \uC74C\uC6D0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div>';
  }
  cont.innerHTML = h;
}

function _hymPlayThis(id){
  if(_hym.currentId === id) _hymTogglePlay();
  else _hymSetQueue([id], 0);
}

function _hymOpenCurrentDetail(){
  if(_hym.currentId) _hymOpenDetail(_hym.currentId);
}
function _hymToggleFavCurrent(){
  if(_hym.selectedId) _hymToggleFav(_hym.selectedId);
}
function _hymUpdateHdrFav(id){
  var btn = document.getElementById('hymHdrFavBtn');
  if(!btn) return;
  btn.style.display = id ? '' : 'none';
  if(id){
    var on = S.hymnFav.has(id);
    btn.className = 'hym-fav-btn' + (on ? ' hym-fav-on' : '');
    btn.innerHTML = '<i class="fa'+(on?'s':'r')+' fa-heart"></i>';
  }
}

function _hymZoomIn(){ _hym.zoom = Math.min(_hym.zoom + 0.25, 3); _hymApplyZoom(); }
function _hymZoomOut(){ _hym.zoom = Math.max(_hym.zoom - 0.25, 0.5); _hymApplyZoom(); }
function _hymZoomReset(){ _hym.zoom = 1; _hymApplyZoom(); }
function _hymApplyZoom(){
  var img = document.getElementById('hymSheetImg');
  if(img) img.style.transform = 'scale('+_hym.zoom+')';
}

/* ── Section 7: Audio Player Engine ── */
function _hymLoadAndPlay(id){
  if(!_hymnHasMp3(id)) return;
  _hymInit();
  var a = _hym.audio;
  if(!a) return;
  _hym.currentId = id;
  _hym.currentTime = 0;
  _hym.duration = 0;
  a.src = _hymnMp3Url(id);
  a.load();
  a.play().catch(function(){});
  S.hymnLastPlayed = id;
  persist();
  _hymShowSpPlayer();
  _hymShowPlayerBar();
  _hymShowGlobalPlayer();
  _hymUpdateAllPlayers();
  if(_hym.spView === 'list') _hymRenderList();
  if(_hym.detailOpen && _hym.selectedId === id) _hymRenderDetail(id);
}

function _hymTogglePlay(){
  var a = _hym.audio;
  if(!a || !a.src) return;
  if(a.paused) a.play().catch(function(){});
  else a.pause();
}

function _hymPrev(){
  if(_hym.queue.length === 0) return;
  if(_hym.currentTime > 3){ _hym.audio.currentTime = 0; return; }
  var idx = _hym.queueIdx - 1;
  if(idx < 0) idx = _hym.queue.length - 1;
  _hym.queueIdx = idx;
  _hymLoadAndPlay(_hym.queue[idx]);
}

function _hymNext(){
  var next = _hymGetNextInQueue();
  if(next !== null) _hymLoadAndPlay(next);
  else { _hym.playing = false; _hymUpdatePlayIcons(); }
}

function _hymSeekTo(fraction){
  var a = _hym.audio;
  if(!a || !a.duration) return;
  a.currentTime = fraction * a.duration;
}

function _hymOnTimeUpdate(){
  var a = _hym.audio;
  if(!a) return;
  _hym.currentTime = a.currentTime;
  _hym.duration = a.duration || 0;
  if(!_hym.seeking) _hymUpdateAllPlayers();
}

function _hymOnEnded(){
  if(_hym.repeat === 'one'){
    _hym.audio.currentTime = 0;
    _hym.audio.play().catch(function(){});
    return;
  }
  var next = _hymGetNextInQueue();
  if(next !== null) _hymLoadAndPlay(next);
  else { _hym.playing = false; _hymUpdatePlayIcons(); }
}

function _hymFormatTime(s){
  if(!s || isNaN(s)) return '0:00';
  var m = Math.floor(s/60);
  var sec = Math.floor(s%60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

// Seek bar interaction
function _hymSeekStart(e, where){
  e.preventDefault(); e.stopPropagation();
  _hym.seeking = true;
  var trackId = where === 'detail' ? 'hymDpTrack' : where === 'sp' ? 'hymSppTrack' : 'hymPbTrack';
  var track = document.getElementById(trackId);
  if(!track) return;
  function doSeek(ev){
    var rect = track.getBoundingClientRect();
    var clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    var frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    _hymSeekTo(frac);
    _hymUpdateSeekVisual(frac, where);
  }
  doSeek(e);
  function onMove(ev){ doSeek(ev); }
  function onUp(){ _hym.seeking = false; document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); document.removeEventListener('touchmove',onMove); document.removeEventListener('touchend',onUp); }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchmove', onMove, {passive:false});
  document.addEventListener('touchend', onUp);
}

function _hymUpdateSeekVisual(frac, where){
  var pct = (frac*100).toFixed(1)+'%';
  if(where === 'detail'){
    var f = document.getElementById('hymDpFill'); if(f) f.style.width = pct;
  } else if(where === 'sp'){
    var f2 = document.getElementById('hymSppFill'); if(f2) f2.style.width = pct;
  } else {
    var f3 = document.getElementById('hymPbFill'); if(f3) f3.style.width = pct;
  }
}

function _hymUpdatePlayIcons(){
  // overlay player bar
  var pbBtn = document.getElementById('hymPbPlayBtn');
  if(pbBtn) pbBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  // detail player
  var dpBtn = document.getElementById('hymDpPlayBtn');
  if(dpBtn) dpBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  // side panel player
  var sppBtn = document.getElementById('hymSppPlayBtn');
  if(sppBtn) sppBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  // global mini player
  var gpBtn = document.getElementById('hymGpPlayBtn');
  if(gpBtn) gpBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  // list items — only update the few visible items (virtual scroll)
  var slice = document.getElementById('hymVsSlice');
  if(slice){
    var items = slice.children;
    for(var i = 0; i < items.length; i++){
      items[i].classList.toggle('hym-playing', parseInt(items[i].dataset.id) === _hym.currentId && _hym.playing);
    }
  }
  // playlist detail items (few items, safe to query all)
  document.querySelectorAll('.hym-pld-item').forEach(function(el){
    el.classList.toggle('hym-playing', parseInt(el.dataset.id) === _hym.currentId && _hym.playing);
  });
}

/* ── Section 8: Player bars (side panel + overlay) ── */
function _hymShowSpPlayer(){
  var el = document.getElementById('hymSpPlayer');
  if(el) el.style.display = '';
}
function _hymShowPlayerBar(){
  var el = document.getElementById('hymPlayerBar');
  if(el) el.style.display = '';
}
function _hymShowGlobalPlayer(){
  var el = document.getElementById('hymGlobalPlayer');
  if(!el) return;
  // Show only when there's a current hymn AND the hymns overlay is NOT open
  var overlay = document.getElementById('hymnsOverlay');
  var overlayVisible = overlay && overlay.style.display !== 'none';
  if(_hym.currentId && !overlayVisible){
    el.style.display = '';
  } else {
    el.style.display = 'none';
  }
}

function _hymUpdateAllPlayers(){
  var pct = (_hym.duration > 0) ? (_hym.currentTime/_hym.duration*100).toFixed(1)+'%' : '0%';
  var time = _hymFormatTime(_hym.currentTime);
  var label = _hym.currentId ? _hymnLabel(_hym.currentId) : '';
  // overlay player bar
  var pbTitle = document.getElementById('hymPbTitle');
  if(pbTitle) pbTitle.textContent = label;
  var pbFill = document.getElementById('hymPbFill');
  if(pbFill) pbFill.style.width = pct;
  var pbTime = document.getElementById('hymPbTime');
  if(pbTime) pbTime.textContent = time;
  var pbBtn = document.getElementById('hymPbPlayBtn');
  if(pbBtn) pbBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  // side panel mini player
  var sppTitle = document.getElementById('hymSppTitle');
  if(sppTitle) sppTitle.textContent = label;
  var sppFill = document.getElementById('hymSppFill');
  if(sppFill) sppFill.style.width = pct;
  var sppBtn = document.getElementById('hymSppPlayBtn');
  if(sppBtn) sppBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  // global mini player
  var gpTitle = document.getElementById('hymGpTitle');
  if(gpTitle) gpTitle.textContent = label;
  var gpBtn = document.getElementById('hymGpPlayBtn');
  if(gpBtn) gpBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  // detail player (only if detail is showing this hymn)
  if(_hym.detailOpen && _hym.currentId === _hym.selectedId){
    var dpFill = document.getElementById('hymDpFill');
    if(dpFill) dpFill.style.width = pct;
    var dpCur = document.getElementById('hymDpTimeCur');
    if(dpCur) dpCur.textContent = time;
    var dpDur = document.getElementById('hymDpTimeDur');
    if(dpDur) dpDur.textContent = _hymFormatTime(_hym.duration);
    var dpBtn = document.getElementById('hymDpPlayBtn');
    if(dpBtn) dpBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  }
}

/* ── Section 9: Playlist Management ── */
function _hymGetPlaylist(plId){
  return S.hymnPlaylists.find(function(p){ return p.id === plId; });
}

function _hymRenderPlaylists(){
  var cont = document.getElementById('hymViewPlaylists');
  if(!cont) return;
  var h = '<div class="hym-pl-header">';
  h += '<button class="hym-back-btn" onclick="_hymSetFilter(\'all\')" title="\uB4A4\uB85C"><i class="fa fa-arrow-left"></i></button>';
  h += '<span class="hym-pl-title"><i class="fa fa-list"></i> \uC7AC\uC0DD\uBAA9\uB85D</span>';
  h += '<button class="hym-pl-new-btn" onclick="_hymCreatePlaylist()"><i class="fa fa-plus"></i> \uC0C8\uB85C \uB9CC\uB4E4\uAE30</button>';
  h += '</div>';
  if(S.hymnPlaylists.length === 0){
    h += '<div class="hym-empty"><i class="fa fa-list"></i>\uC7AC\uC0DD\uBAA9\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div>';
  } else {
    for(var i=0; i<S.hymnPlaylists.length; i++){
      var pl = S.hymnPlaylists[i];
      h += '<div class="hym-pl-item" onclick="_hymOpenPlaylist(\''+pl.id+'\')">';
      h += '<i class="fa fa-list-ol hym-pl-icon"></i>';
      h += '<span class="hym-pl-name">'+_escHtml(pl.name)+'</span>';
      h += '<span class="hym-pl-count">'+pl.ids.length+'\uACE1</span>';
      h += '<button class="hym-pl-del-btn" onclick="_hymDeletePlaylist(\''+pl.id+'\',event)" title="\uC0AD\uC81C"><i class="fa fa-trash"></i></button>';
      h += '</div>';
    }
  }
  cont.innerHTML = h;
}

function _hymCreatePlaylist(){
  var name = prompt('\uC7AC\uC0DD\uBAA9\uB85D \uC774\uB984:');
  if(!name || !name.trim()) return;
  S.hymnPlaylists.push({id:'pl_'+Date.now(), name:name.trim(), ids:[]});
  persist();
  _hymRenderPlaylists();
}

function _hymDeletePlaylist(plId, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  if(!confirm('\uC774 \uC7AC\uC0DD\uBAA9\uB85D\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?')) return;
  S.hymnPlaylists = S.hymnPlaylists.filter(function(p){ return p.id !== plId; });
  persist();
  _hymRenderPlaylists();
}

function _hymOpenPlaylist(plId){
  _hym.currentPlaylistId = plId;
  _hymShowSpView('playlist-detail');
}

function _hymRenderPlaylistDetail(plId){
  var cont = document.getElementById('hymViewPlaylistDetail');
  var pl = _hymGetPlaylist(plId);
  if(!cont || !pl) return;
  var h = '<div class="hym-pld-header">';
  h += '<button class="hym-back-btn" onclick="_hymShowSpView(\'playlists\')" style="margin-right:4px"><i class="fa fa-arrow-left"></i></button>';
  h += '<span class="hym-pld-title">'+_escHtml(pl.name)+' <small style="color:var(--text3)">'+pl.ids.length+'\uACE1</small></span>';
  if(pl.ids.length > 0){
    h += '<button class="hym-pld-play-all" onclick="_hymPlayPlaylist(\''+plId+'\')"><i class="fa fa-play"></i> \uC804\uCCB4</button>';
  }
  h += '</div>';
  if(pl.ids.length === 0){
    h += '<div class="hym-empty"><i class="fa fa-music"></i>\uACE1\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div>';
  } else {
    for(var i=0; i<pl.ids.length; i++){
      var id = pl.ids[i];
      var isPlaying = _hym.currentId === id && _hym.playing;
      h += '<div class="hym-pld-item'+(isPlaying?' hym-playing':'')+'" data-id="'+id+'" onclick="_hymOpenDetail('+id+')">';
      h += '<span class="hym-pld-num">'+(i+1)+'</span>';
      h += '<span class="hym-pld-name">'+_hymnLabel(id)+'</span>';
      if(_hymnHasMp3(id)) h += '<button class="hym-play-btn" onclick="_hymPlayPlaylistFrom(\''+plId+'\','+i+',event)" title="\uC7AC\uC0DD"><i class="fa fa-play"></i></button>';
      h += '<button class="hym-pld-remove" onclick="_hymRemoveFromPlaylist(\''+plId+'\','+i+',event)" title="\uC81C\uAC70"><i class="fa fa-times"></i></button>';
      h += '</div>';
    }
  }
  cont.innerHTML = h;
}

function _hymAddToPlaylist(hymnId, plId){
  var pl = _hymGetPlaylist(plId);
  if(!pl) return;
  if(pl.ids.indexOf(hymnId) === -1){ pl.ids.push(hymnId); persist(); }
  _hymCloseAddMenu();
  if(typeof showToast === 'function') showToast(_hymnLabel(hymnId)+' \u2192 '+pl.name);
}

function _hymRemoveFromPlaylist(plId, idx, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  var pl = _hymGetPlaylist(plId);
  if(!pl) return;
  pl.ids.splice(idx, 1);
  persist();
  _hymRenderPlaylistDetail(plId);
}

function _hymPlayPlaylist(plId){
  var pl = _hymGetPlaylist(plId);
  if(!pl || pl.ids.length === 0) return;
  var playable = pl.ids.filter(function(id){ return _hymnHasMp3(id); });
  if(playable.length === 0) return;
  _hym.queueName = pl.name;
  _hymSetQueue(playable, 0);
}

function _hymPlayPlaylistFrom(plId, idx, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  var pl = _hymGetPlaylist(plId);
  if(!pl) return;
  var playable = pl.ids.filter(function(id){ return _hymnHasMp3(id); });
  if(playable.length === 0) return;
  var targetId = pl.ids[idx];
  var qIdx = playable.indexOf(targetId);
  if(qIdx === -1) qIdx = 0;
  _hym.queueName = pl.name;
  _hymSetQueue(playable, qIdx);
}

function _hymShowAddMenu(hymnId, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  _hymCloseAddMenu();
  _hym.addMenuId = hymnId;
  var menu = document.createElement('div');
  menu.className = 'hym-add-menu';
  menu.id = 'hymAddMenu';
  var h = '<div class="hym-add-menu-title">\uC7AC\uC0DD\uBAA9\uB85D\uC5D0 \uCD94\uAC00</div>';
  if(S.hymnPlaylists.length === 0){
    h += '<div class="hym-add-menu-item" onclick="_hymCreateAndAdd('+hymnId+')"><i class="fa fa-plus"></i> \uC0C8 \uC7AC\uC0DD\uBAA9\uB85D...</div>';
  } else {
    for(var i=0; i<S.hymnPlaylists.length; i++){
      var pl = S.hymnPlaylists[i];
      h += '<div class="hym-add-menu-item" onclick="_hymAddToPlaylist('+hymnId+',\''+pl.id+'\')"><i class="fa fa-list-ol"></i> '+_escHtml(pl.name)+'</div>';
    }
    h += '<div class="hym-add-menu-item" onclick="_hymCreateAndAdd('+hymnId+')"><i class="fa fa-plus"></i> \uC0C8 \uC7AC\uC0DD\uBAA9\uB85D...</div>';
  }
  menu.innerHTML = h;
  document.body.appendChild(menu);
  var rect = e.target.getBoundingClientRect();
  menu.style.top = Math.min(rect.bottom + 4, window.innerHeight - menu.offsetHeight - 10) + 'px';
  menu.style.left = Math.min(rect.left, window.innerWidth - menu.offsetWidth - 10) + 'px';
  setTimeout(function(){ document.addEventListener('click', _hymCloseAddMenu, {once:true}); }, 10);
}

function _hymCloseAddMenu(){
  var menu = document.getElementById('hymAddMenu');
  if(menu) menu.remove();
  _hym.addMenuId = null;
}

function _hymCreateAndAdd(hymnId){
  _hymCloseAddMenu();
  var name = prompt('\uC7AC\uC0DD\uBAA9\uB85D \uC774\uB984:');
  if(!name || !name.trim()) return;
  var pl = {id:'pl_'+Date.now(), name:name.trim(), ids:[hymnId]};
  S.hymnPlaylists.push(pl);
  persist();
  if(typeof showToast === 'function') showToast(_hymnLabel(hymnId)+' \u2192 '+pl.name);
}

/* ── Section 10: Queue Management ── */
function _hymSetQueue(ids, startIdx){
  _hym.queue = ids.slice();
  _hym.queueIdx = startIdx || 0;
  if(_hym.shuffle) _hymShuffleQueue();
  _hymLoadAndPlay(_hym.queue[_hym.queueIdx]);
}

function _hymToggleShuffle(){
  _hym.shuffle = !_hym.shuffle;
  if(_hym.shuffle && _hym.queue.length > 1) _hymShuffleQueue();
  if(_hym.detailOpen) _hymRenderDetail(_hym.selectedId);
}

function _hymShuffleQueue(){
  var current = _hym.queue[_hym.queueIdx];
  for(var i = _hym.queue.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = _hym.queue[i]; _hym.queue[i] = _hym.queue[j]; _hym.queue[j] = tmp;
  }
  var ci = _hym.queue.indexOf(current);
  if(ci > 0){ _hym.queue[ci] = _hym.queue[0]; _hym.queue[0] = current; }
  _hym.queueIdx = 0;
}

function _hymToggleRepeat(){
  if(_hym.repeat === 'none') _hym.repeat = 'all';
  else if(_hym.repeat === 'all') _hym.repeat = 'one';
  else _hym.repeat = 'none';
  if(_hym.detailOpen) _hymRenderDetail(_hym.selectedId);
}

function _hymGetNextInQueue(){
  if(_hym.queue.length === 0) return null;
  var next = _hym.queueIdx + 1;
  if(next >= _hym.queue.length){
    if(_hym.repeat === 'all') next = 0;
    else return null;
  }
  _hym.queueIdx = next;
  return _hym.queue[next];
}

/* ── Section 11: Keyboard Shortcuts ── */
function _hymKeyHandler(e){
  if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  // only when detail overlay is open
  if(!_hym.detailOpen) return;
  if(e.key === 'Escape'){ e.preventDefault(); _hymCloseDetail(); return; }
  if(e.key === ' '){ e.preventDefault(); _hymTogglePlay(); return; }
  if(e.key === 'ArrowLeft'){ e.preventDefault(); if(_hym.audio && _hym.audio.src) _hym.audio.currentTime = Math.max(0, _hym.audio.currentTime - 5); return; }
  if(e.key === 'ArrowRight'){ e.preventDefault(); if(_hym.audio && _hym.audio.src) _hym.audio.currentTime = Math.min(_hym.audio.duration||0, _hym.audio.currentTime + 5); return; }
}
document.addEventListener('keydown', _hymKeyHandler);

/* ── Utility ── */
function _escHtml(s){
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/* ── Expose to global ── */
window._hymInitSidePanel = _hymInitSidePanel;
window._hymShowSpView = _hymShowSpView;
window._hymOpenDetail = _hymOpenDetail;
window._hymCloseDetail = _hymCloseDetail;
/* ── Title language toggle ── */
function _hymToggleTitleLang(){
  _hym.titleLang = (_hym.titleLang === 'ko') ? 'en' : 'ko';
  var btn = document.getElementById('hymLangBtn');
  if(btn) btn.textContent = _hym.titleLang === 'ko' ? '한' : 'EN';
  // re-render current view
  if(_hym.spView === 'list') _hymRenderList();
  else if(_hym.spView === 'playlists') _hymRenderPlaylists();
  else if(_hym.spView === 'playlist-detail' && _hym.currentPlaylistId) _hymRenderPlaylistDetail(_hym.currentPlaylistId);
  // update player bar titles
  _hymUpdateAllPlayers();
}

window._hymToggleTitleLang = _hymToggleTitleLang;
window._hymOnSearch = _hymOnSearch;
window._hymSetFilter = _hymSetFilter;
window._hymToggleFav = _hymToggleFav;
window._hymQuickPlay = _hymQuickPlay;
window._hymPlayThis = _hymPlayThis;
window._hymOpenCurrentDetail = _hymOpenCurrentDetail;
window._hymZoomIn = _hymZoomIn;
window._hymZoomOut = _hymZoomOut;
window._hymZoomReset = _hymZoomReset;
window._hymTogglePlay = _hymTogglePlay;
window._hymPrev = _hymPrev;
window._hymNext = _hymNext;
window._hymSeekStart = _hymSeekStart;
window._hymToggleShuffle = _hymToggleShuffle;
window._hymToggleRepeat = _hymToggleRepeat;
window._hymCreatePlaylist = _hymCreatePlaylist;
window._hymDeletePlaylist = _hymDeletePlaylist;
window._hymOpenPlaylist = _hymOpenPlaylist;
window._hymAddToPlaylist = _hymAddToPlaylist;
window._hymRemoveFromPlaylist = _hymRemoveFromPlaylist;
window._hymPlayPlaylist = _hymPlayPlaylist;
window._hymPlayPlaylistFrom = _hymPlayPlaylistFrom;
window._hymShowAddMenu = _hymShowAddMenu;
window._hymCloseAddMenu = _hymCloseAddMenu;
window._hymCreateAndAdd = _hymCreateAndAdd;
