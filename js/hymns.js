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

var HYMN_TITLES_KO={1:'O Worship the King',2:'Love Divine',3:'Sing Praise to God Who Reigns Above',4:'Praise Ye the Triune God!',5:'Begin, My Tongue, Some Heavenly Theme',6:'Come, Thou Almighty King',7:'Praise Our God',8:'All People That on Earth Do Dwell',9:'His Loving-Kindness',10:'O God, Our Help in Ages Past',11:'When All Thy Mercies, O My God',12:'Great God of Wonders!',13:'Praise Ye the Lord, the Almighty',14:'God of Everlasting Glory',15:'Brethren, We Have Met to Worship',16:'The Lord Is King!',17:'Come, Thou Fount',18:'Now Thank We All Our God',19:'The God of Abraham Praise',20:'We Praise Thee, O God, Our Redeemer',21:'We Gather Together',22:'Ancient of Days',23:'Come, We That Love the Lord',24:'We Magnify Our Father God',25:'The Great Creator',26:'Rejoice, Ye Pure in Heart',27:'I Sing the Mighty Power of God',28:'Holy God, We Praise Thy Name',29:'Praise the Lord! Ye Heavens, Adore Him',30:'Bless the Lord',31:'All Creatures of Our God and King',32:'Blessed Be the Name',33:'Stand Up and Bless the Lord',34:'Immortal, Invisible',35:'Praise, My Soul, the King of Heaven',36:'A Mighty Fortress Is Our God',37:'How Great Thou Art!',38:'Joyful, Joyful, We Adore Thee',39:'This Is My Father\'s World',40:'Great Is Thy Faithfulness',41:'Oh, He\'s a Wonderful Savior',42:'All Hail the Power',43:'All Hail the Power',44:'And Can It Be That I Should Gain?',45:'Ye Servants of God, Your Master Proclaim',46:'O for a Thousand Tongues',47:'All Glory to Jesus',48:'His Matchless Worth',49:'Our Great Savior',50:'Fairest Lord Jesus!',51:'Praise the Savior',52:'Majestic Sweetness Sits Enthroned',53:'How Sweet the Name of Jesus Sounds',54:'For the Beauty of the Earth',55:'Come, Christians, Join to Sing',56:'I Am His and He Is Mine',57:'Jesus, I Am Resting',58:'Jesus, the Very Thought of Thee',59:'The Great Physician',60:'Shepherd of Eager Youth',61:'O the Deep, Deep Love of Jesus',62:'Crown Him with Many Crowns',63:'Take the Name of Jesus with You',64:'The Name of Jesus',65:'Jesus! Jesus! Jesus!',66:'Jesus, Thou Joy of Loving Hearts',67:'How Can It Be?',68:'O Day of Rest and Gladness',69:'Safely Through Another Week',70:'Holy, Holy, Holy',71:'Blessed Day of Rest and Cheer',72:'Still, Still with Thee',73:'May Jesus Christ Be Praised',74:'Now the Day Is Over',75:'Abide with Me',76:'Savior, Breathe an Evening Blessing',77:'Sun of My Soul',78:'Day Is Dying in the West',79:'Softly Now the Light of Day',80:'Lord, Dismiss Us with Thy Blessing',81:'Savior, Again to Thy Dear Name',82:'God Be with You',83:'O Come, O Come, Emmanuel',84:'Come, Thou Long-Expected Jesus',85:'Silent Night! Holy Night!',86:'Away in a Manger',87:'Joy to the World!',88:'In a Cave',89:'Angels We Have Heard on High',90:'It Came upon the Midnight Clear',91:'The First Noel',92:'O Little Town of Bethlehem',93:'Hark! the Herald Angels Sing',94:'What Child Is This?',95:'While Shepherds Watched Their Flocks',96:'As with Gladness Men of Old',97:'There\'s a Song in the Air!',98:'I Heard the Bells on Christmas Day',99:'Angels, from the Realms of Glory',100:'O Come, All Ye Faithful',101:'Thou Didst Leave Thy Throne',102:'Jesus, Wonderful Lord!',103:'One Day!',104:'Immortal Love - Forever Full',105:'That Beautiful Name',106:'Tell Me the Story of Jesus',107:'Hosanna, Loud Hosanna',108:'All Glory, Laud and Honor',109:'Ride On! Ride On in Majesty!',110:'Alas! and Did My Savior Bleed?',111:'What Will You Do with Jesus?',112:'Blessed Redeemer',113:'The Old Rugged Cross',114:'There Is a Green Hill Far Away',115:'Ivory Palaces',116:'O Sacred Head, Now Wounded',117:'He Was Wounded for Our Transgressions',118:'When I Survey the Wondrous Cross',119:'\'Tis Midnight - and on Olive\'s Brow',120:'Opened for Me',121:'Blessed Calvary!',122:'Why?',123:'In the Cross of Christ I Glory',124:'Lead Me to Calvary',125:'Jesus Paid It All',126:'Rock of Ages',127:'Hallelujah, What a Savior!',128:'Wounded for Me',129:'At the Cross',130:'God Incarnate, Jesus Came',131:'Lift Up, Lift Up Your Voices Now',132:'He Lives',133:'The Strife Is O\'er',134:'I Know That My Redeemer Liveth',135:'The Day of Resurrection',136:'Christ Is Risen from the Dead',137:'Christ the Lord Is Risen Today',138:'Christ Arose',139:'Golden Harps Are Sounding',140:'Open Wide, Ye Doors',141:'Look Ye Saints! the Sight Is Glorious',142:'Jesus Shall Reign',143:'Rejoice - the Lord Is King!',144:'Hark! Ten Thousands Harps and Voices',145:'Hail, Thou Once-Despised Jesus!',146:'Sooner or Later',147:'There\'ll Be No Dark Valley',148:'Will Jesus Find Us Watching?',149:'When We See Christ',150:'When He Cometh',151:'Jesus Is Coming Again',152:'Lo! He Comes, with Clouds Descending',153:'What If It Were Today?',154:'For God So Loved the World',155:'He Is Coming Again',156:'Christ Returneth!',157:'What a Gathering!',158:'Come, Holy Spirit, Heavenly Dove',159:'Blessed Quietness',160:'Channels Only',161:'The Comforter Has Come',162:'Fill Me Now',163:'Open My Eyes, That I May See',164:'Breathe on Me, Breath of God',165:'Holy Ghost, with Light Divine',166:'Cleanse Me',167:'Holy Spirit, Now Outpoured',168:'Even Me',169:'Holy Spirit, Faithful Guide',170:'O Breath of Life',171:'Spirit of God, Descend upon My Heart',172:'O Word of God Incarnate',173:'Thy Word Is Like a Garden, Lord',174:'The Old Book and the Old Faith',175:'Standing on the Promises',176:'Break Thou the Bread of Life',177:'Thy Word Have I Hid in My Heart',178:'The Bible Stands',179:'Holy Bible, Book Divine',191:'Here, O My Lord, I See Thee Face to Face',192:'According to Thy Gracious Word',193:'No, Not Desparingly',194:'Ye Must Be Born Again',195:'Look and Live',196:'Blessed Be the Fountain',197:'Hallelujah, \'Tis Done!',198:'There Is Power in the Blood',199:'Christ Receiveth Sinful Men',200:'My Sins Are Blotted Out, I Know!',201:'He Is Able to Deliver Thee',202:'In Times Like These',203:'Whosoever Will',204:'Turn Your Eyes upon Jesus',205:'Once for All!',206:'Wonderful Grace of Jesus',207:'O Happy Day!',208:'Are You Washed in the Blood?',209:'Grace Greater Than Our Sin',210:'Saved By the Blood',211:'Hallelujah for the Cross!',212:'Nothing But the Blood',213:'The Light of the World Is Jesus',214:'Verily, Verily',215:'Nor Silver nor Gold',216:'Look to the Lamb of God',217:'Jesus, Thy Blood and Righteousness',218:'Burdens Are Lifted at Calvary',219:'Grace! \'Tis a Charming Sound',220:'I\'ll Stand By Until the Morning',221:'Thank You, Lord',222:'There Is a Fountain',223:'Arise, My Soul, Arise!',224:'I Know Whom I Have Believed',225:'I Heard the Voice of Jesus Say',226:'My Savior',227:'The Cleansing Wave',228:'My Faith Has Found a Resting Place',229:'Tell Me the Old, Old Story',230:'Saved, Saved!',231:'Jesus Saves!',232:'When I See the Blood',233:'Depth of Mercy',234:'Wonderful Words of Life',235:'Pass Me Not',236:'Amazing Grace',237:'Why Do You Wait?',238:'O Jesus, Thou Art Standing',239:'Art Thou Weary?',240:'I Am Coming, Lord',241:'Have You Any Room for Jesus?',242:'Jesus, I Come',243:'Room at the Cross for You',244:'Let Jesus Come into Your Heart',245:'I Am Praying for You',246:'Softly and Tenderly',247:'Jesus Is Calling',248:'Why Not Now?',249:'Just As I Am',250:'God\'s Final Call',251:'Almost Persuaded',252:'Only Trust Him',253:'Lord, I\'m Coming Home',254:'Come to the Savior',255:'Blessed Assurance',256:'It Is Well with My Soul',257:'\'Tis So Sweet to Trust in Jesus',258:'He Hideth My Soul',259:'The Rock That Is Higher Than I',260:'Is My Name Written There?',261:'Trust and Obey',262:'Trusting Jesus',263:'A Shelter in the Time of the Storm',264:'In the Garden',265:'We Have an Anchor',266:'Fade, Fade, Each Earthly Joy',267:'All Things Work Out for Good',268:'How Firm a Foundation',269:'Under His Wings',270:'The Haven of Rest',271:'My Anchor Holds',272:'The Solid Rock',273:'Walk in the Light',274:'Jesus Never Fails',275:'I Belong to the King',276:'In the Hour of Trial',277:'O Thou, in Whose Presence',278:'I Am Trusting Thee, Lord Jesus',279:'A Child of the King!',280:'Moment by Moment',281:'Never Alone',282:'Hiding in Thee',283:'Yesterday, Today, Forever',284:'Sweet Peace, the Gift of God\'s Love',285:'Peace, Perfect Peace',286:'Come, Ye Disconsolate',287:'Like a River Glorious',288:'Wonderful Peace',289:'Does Jesus Care?',290:'Be Still, My Soul',291:'Guide Me, O Thou Great Jehovah',292:'Surely Goodness and Mercy',293:'The Lord\'s My Shepherd',294:'Savior, Like a Shepherd Lead Us',295:'He Leadeth Me',296:'All the Way My Savior Leads Me',297:'God Will Take Care of You',298:'God Leads Us Along',299:'Day by Day',300:'More Secure Is No One Ever',301:'The King of Love My Shepherd Is',302:'Lead Me, Savior',303:'Jesus, Savior, Pilot Me',304:'Savior, More Than Life to Me',305:'Just One Step at a Time',306:'A Passion for Souls',307:'I with Thee Would Begin',308:'Higher Ground',309:'Beneath the Cross of Jesus',310:'Whiter Than Snow',311:'We Would See Jesus',312:'O Perfect Love',313:'Stepping in the Light',314:'I Am Thine, O Lord',315:'Deeper and Deeper',316:'O to Be Like Thee!',317:'A Charge to Keep I Have',318:'I Need Thee Every Hour',319:'I Would Be True',320:'O I Want to Be Like Jesus',321:'Nothing Between',322:'Near to Thy Heart',323:'More Love to Thee',324:'A Student\'s Prayer',325:'More Like the Master',326:'More About Jesus',327:'O for a Faith That Will Not Shrink',328:'Close to Thee',329:'Sitting at the Feet of Jesus',330:'Fill All My Vision',331:'Make Me a Channel of Blessing',332:'My Jesus, I Love Thee',333:'May the Mind of Christ, My Savior',334:'Be Thou My Vision',335:'God of Our Youth',336:'O for a Closer Walk with God',337:'Teach Me Thy Way, O Lord',338:'O Grant Thy Touch',339:'O Love That Wilt Not Let Me Go',340:'Nearer, Still Nearer',341:'Something for Thee',342:'Must Jesus Bear the Cross Alone?',343:'I Want a Principle Within',344:'I Must Tell Jesus',345:'\'Tis the Blessed Hour of Prayer',346:'Teach Me to Pray',347:'Tell It to Jesus',348:'The Beautiful Garden of Prayer',349:'There Shall Be Showers of Blessing',350:'Teach Me to Trust',351:'Near the Cross',352:'Jesus, Lover of My Soul',353:'Leave It There',354:'What a Friend We Have in Jesus',355:'From Every Stormy Wind That Blows',356:'Near to the Heart of God',357:'Nearer, My God, to Thee',358:'Dear Lord and Father of Mankind',359:'My Faith Looks Up to Thee',360:'Speak, Lord, in the Stillness',361:'Sweet Hour of Prayer',362:'More Holiness Give Me',363:'Dare to Be a Daniel',364:'Yield Not to Temptation',365:'Are Ye Able, Said the Master',366:'Give Me Thy Heart',367:'His Way with Thee',368:'Have I Done My Best for Jesus?',369:'Give of Your Best to the Master',370:'Count Your Blessings',371:'Let the Lower Lights Be Burning',372:'Who Is on the Lord\'s Side?',373:'You May Have the Joy-Bells',374:'Jesus Calls Us',375:'I Gave My Life for Thee',376:'Take Time to Be Holy',377:'Stand Up for Jesus',378:'Stand Up for Jesus',379:'Fight the Good Fight',380:'Rise Up, O Men of God!',381:'Is Your All on the Altar?',382:'Trust, Try, and Prove Me',383:'Follow, I Will Follow Thee',384:'Where He Leads Me',385:'Take the World, but Give Me Jesus',386:'All for Jesus',387:'True-Hearted, Whole-Hearted',388:'Have Thine Own Way, Lord!',389:'I Am Resolved',390:'Jesus, I My Cross Have Taken',391:'A Flag to Follow',392:'O Jesus, I Have Promised',393:'Take My Life and Let It Be',394:'I Surrender All',395:'Only One Life',396:'I\'ll Live for Him',397:'I Have Decided to Follow Jesus',398:'Follow On',399:'My Heart\'s Prayer',400:'Jesus, and Shall It Ever Be?',401:'Where He Leads I\'ll Follow',402:'Faith Is the Victory',403:'Soldiers of Christ, Arise',404:'The Fight Is On',405:'My Soul, Be on Thy Guard',406:'I\'m a Soldier',407:'Lead On, O King Eternal',408:'Loyalty to Christ',409:'Hold the Fort',410:'The Banner of the Cross',411:'Victory Through Grace',412:'The Son of God Goes Forth to War',413:'Sound the Battle Cry!',414:'Am I a Soldier of the Cross?',415:'Ye Christian Heralds',416:'So Send I You',417:'In Christ There Is No East or West',418:'Must I Go, and Empty-Handed?',419:'The Call for Reapers',420:'Bringing In the Sheaves',421:'Go Tell the Untold Millions',422:'Anywhere with Jesus',423:'We\'ve a Story to Tell',424:'Send the Light!',425:'Seeking the Lost',426:'Throw Out the Life-Line',427:'Go Ye into All the World',428:'To the Work!',429:'Ready',430:'O Zion, Haste',431:'I Love to Tell the Story',432:'Rescue the Perishing',433:'From Greenland\'s Icy Mountains',434:'Hail to the Brightness',435:'Lord, Speak to Me',436:'Bring Them In',437:'O Master, Let Me Walk with Thee',438:'Footsteps of Jesus',439:'Work, for the Night Is Coming',440:'I\'ll Go Where You Want Me to Go',441:'Love Lifted Me',442:'Praise Him! Praise Him!',443:'There Is No Name So Sweet on Earth',444:'There\'s a Wideness in God\'s Mercy',445:'No, Not One!',446:'Satisfied',447:'The Lily of the Valley',448:'He Ransomed Me',449:'To God Be the Glory',450:'Isn\'t the Love of Jesus Something Wonderful!',451:'Wonderful, Wonderful Jesus!',452:'My Savior\'s Love',453:'He Keeps Me Singing',454:'What a Wonderful Savior!',455:'In My Heart There Rings a Melody',456:'He Is So Precious to Me',457:'In My Heart',458:'Ring the Bells of Heaven!',459:'He Lifted Me',460:'Leaning on the Everlasting Arms',461:'O It Is Wonderful!',462:'Sunshine in My Soul',463:'All That Thrills My Soul',464:'I Will Praise Him!',465:'Springs of Living Water',466:'Christ Liveth in Me',467:'Since I Have Been Redeemed',468:'I Will Sing the Wondrous Story',469:'I\'ve Found a Friend',470:'Jesus Is All the World to Me',471:'Love Found a Way',472:'Heavenly Sunlight',473:'Heaven Came Down and Glory Filled My Soul',474:'Only a Sinner',475:'Redeemed',476:'It Is Glory Just to Walk with Him',477:'At Calvary',478:'Constantly Abiding',479:'Jesus Loves Me',480:'In Tenderness He Sought Me',481:'Sunlight',482:'Walking in the Light',483:'O How I Love Jesus',484:'Still Sweeter Every Day',486:'Sweeter as the Years Go By',487:'Now I Belong to Jesus',488:'My Redeemer',489:'Glory to His Name',490:'When Love Shines In',491:'Heavenly Joy Is Ringing',492:'Jesus Loves Even Me',493:'Since the Savior Found Me',494:'It\'s Just Like His Great Love',495:'Unsearchable Riches',496:'Victory in Jesus',497:'When I Can Read My Title Clear',498:'When We All Get to Heaven',499:'I\'ve a Home Beyond the River',500:'When the Roll Is Called Up Yonder',501:'After',502:'My Savior First of All',503:'My Home, Sweet Home',504:'Sweet By and By',505:'O That Will Be Glory',506:'Meet Me There',507:'When We All Get Home',508:'For All the Saints',509:'The Sands of Time Are Sinking',510:'Shall We Gather at the River?',511:'Face to Face',512:'Saved By Grace',513:'He the Pearly Gates Will Open',514:'We\'re Marching to Zion',515:'Beulah Land',516:'I\'m Going Home',517:'On Jordan\'s Stormy Banks',518:'Over the Sunset Mountains',519:'Great God, We Sing That Mighty Hand',520:'Another Year Is Dawning',521:'Where Cross the Crowded Ways of Life',522:'Our Thanks, O God, for Fathers',523:'Happy the Home When God Is There',524:'Gracious Savior, Who Didst Honor',525:'A Christian Home',526:'Come, Ye Thankful People',527:'Thanks to God!',528:'The Star-Spangled Banner',529:'My Country, \'Tis of Thee',530:'Battle Hymn of the Republic',531:'America the Beautiful',532:'God of Our Fathers',533:'We Bid Thee Welcome'};
var HYMN_TITLES_EN={1:'O Worship the King',2:'Love Divine',3:'Sing Praise to God Who Reigns Above',4:'Praise Ye the Triune God!',5:'Begin, My Tongue, Some Heavenly Theme',6:'Come, Thou Almighty King',7:'Praise Our God',8:'All People That on Earth Do Dwell',9:'His Loving-Kindness',10:'O God, Our Help in Ages Past',11:'When All Thy Mercies, O My God',12:'Great God of Wonders!',13:'Praise Ye the Lord, the Almighty',14:'God of Everlasting Glory',15:'Brethren, We Have Met to Worship',16:'The Lord Is King!',17:'Come, Thou Fount',18:'Now Thank We All Our God',19:'The God of Abraham Praise',20:'We Praise Thee, O God, Our Redeemer',21:'We Gather Together',22:'Ancient of Days',23:'Come, We That Love the Lord',24:'We Magnify Our Father God',25:'The Great Creator',26:'Rejoice, Ye Pure in Heart',27:'I Sing the Mighty Power of God',28:'Holy God, We Praise Thy Name',29:'Praise the Lord! Ye Heavens, Adore Him',30:'Bless the Lord',31:'All Creatures of Our God and King',32:'Blessed Be the Name',33:'Stand Up and Bless the Lord',34:'Immortal, Invisible',35:'Praise, My Soul, the King of Heaven',36:'A Mighty Fortress Is Our God',37:'How Great Thou Art!',38:'Joyful, Joyful, We Adore Thee',39:'This Is My Father\'s World',40:'Great Is Thy Faithfulness',41:'Oh, He\'s a Wonderful Savior',42:'All Hail the Power',43:'All Hail the Power',44:'And Can It Be That I Should Gain?',45:'Ye Servants of God, Your Master Proclaim',46:'O for a Thousand Tongues',47:'All Glory to Jesus',48:'His Matchless Worth',49:'Our Great Savior',50:'Fairest Lord Jesus!',51:'Praise the Savior',52:'Majestic Sweetness Sits Enthroned',53:'How Sweet the Name of Jesus Sounds',54:'For the Beauty of the Earth',55:'Come, Christians, Join to Sing',56:'I Am His and He Is Mine',57:'Jesus, I Am Resting',58:'Jesus, the Very Thought of Thee',59:'The Great Physician',60:'Shepherd of Eager Youth',61:'O the Deep, Deep Love of Jesus',62:'Crown Him with Many Crowns',63:'Take the Name of Jesus with You',64:'The Name of Jesus',65:'Jesus! Jesus! Jesus!',66:'Jesus, Thou Joy of Loving Hearts',67:'How Can It Be?',68:'O Day of Rest and Gladness',69:'Safely Through Another Week',70:'Holy, Holy, Holy',71:'Blessed Day of Rest and Cheer',72:'Still, Still with Thee',73:'May Jesus Christ Be Praised',74:'Now the Day Is Over',75:'Abide with Me',76:'Savior, Breathe an Evening Blessing',77:'Sun of My Soul',78:'Day Is Dying in the West',79:'Softly Now the Light of Day',80:'Lord, Dismiss Us with Thy Blessing',81:'Savior, Again to Thy Dear Name',82:'God Be with You',83:'O Come, O Come, Emmanuel',84:'Come, Thou Long-Expected Jesus',85:'Silent Night! Holy Night!',86:'Away in a Manger',87:'Joy to the World!',88:'In a Cave',89:'Angels We Have Heard on High',90:'It Came upon the Midnight Clear',91:'The First Noel',92:'O Little Town of Bethlehem',93:'Hark! the Herald Angels Sing',94:'What Child Is This?',95:'While Shepherds Watched Their Flocks',96:'As with Gladness Men of Old',97:'There\'s a Song in the Air!',98:'I Heard the Bells on Christmas Day',99:'Angels, from the Realms of Glory',100:'O Come, All Ye Faithful',101:'Thou Didst Leave Thy Throne',102:'Jesus, Wonderful Lord!',103:'One Day!',104:'Immortal Love - Forever Full',105:'That Beautiful Name',106:'Tell Me the Story of Jesus',107:'Hosanna, Loud Hosanna',108:'All Glory, Laud and Honor',109:'Ride On! Ride On in Majesty!',110:'Alas! and Did My Savior Bleed?',111:'What Will You Do with Jesus?',112:'Blessed Redeemer',113:'The Old Rugged Cross',114:'There Is a Green Hill Far Away',115:'Ivory Palaces',116:'O Sacred Head, Now Wounded',117:'He Was Wounded for Our Transgressions',118:'When I Survey the Wondrous Cross',119:'\'Tis Midnight - and on Olive\'s Brow',120:'Opened for Me',121:'Blessed Calvary!',122:'Why?',123:'In the Cross of Christ I Glory',124:'Lead Me to Calvary',125:'Jesus Paid It All',126:'Rock of Ages',127:'Hallelujah, What a Savior!',128:'Wounded for Me',129:'At the Cross',130:'God Incarnate, Jesus Came',131:'Lift Up, Lift Up Your Voices Now',132:'He Lives',133:'The Strife Is O\'er',134:'I Know That My Redeemer Liveth',135:'The Day of Resurrection',136:'Christ Is Risen from the Dead',137:'Christ the Lord Is Risen Today',138:'Christ Arose',139:'Golden Harps Are Sounding',140:'Open Wide, Ye Doors',141:'Look Ye Saints! the Sight Is Glorious',142:'Jesus Shall Reign',143:'Rejoice - the Lord Is King!',144:'Hark! Ten Thousands Harps and Voices',145:'Hail, Thou Once-Despised Jesus!',146:'Sooner or Later',147:'There\'ll Be No Dark Valley',148:'Will Jesus Find Us Watching?',149:'When We See Christ',150:'When He Cometh',151:'Jesus Is Coming Again',152:'Lo! He Comes, with Clouds Descending',153:'What If It Were Today?',154:'For God So Loved the World',155:'He Is Coming Again',156:'Christ Returneth!',157:'What a Gathering!',158:'Come, Holy Spirit, Heavenly Dove',159:'Blessed Quietness',160:'Channels Only',161:'The Comforter Has Come',162:'Fill Me Now',163:'Open My Eyes, That I May See',164:'Breathe on Me, Breath of God',165:'Holy Ghost, with Light Divine',166:'Cleanse Me',167:'Holy Spirit, Now Outpoured',168:'Even Me',169:'Holy Spirit, Faithful Guide',170:'O Breath of Life',171:'Spirit of God, Descend upon My Heart',172:'O Word of God Incarnate',173:'Thy Word Is Like a Garden, Lord',174:'The Old Book and the Old Faith',175:'Standing on the Promises',176:'Break Thou the Bread of Life',177:'Thy Word Have I Hid in My Heart',178:'The Bible Stands',179:'Holy Bible, Book Divine',191:'Here, O My Lord, I See Thee Face to Face',192:'According to Thy Gracious Word',193:'No, Not Desparingly',194:'Ye Must Be Born Again',195:'Look and Live',196:'Blessed Be the Fountain',197:'Hallelujah, \'Tis Done!',198:'There Is Power in the Blood',199:'Christ Receiveth Sinful Men',200:'My Sins Are Blotted Out, I Know!',201:'He Is Able to Deliver Thee',202:'In Times Like These',203:'Whosoever Will',204:'Turn Your Eyes upon Jesus',205:'Once for All!',206:'Wonderful Grace of Jesus',207:'O Happy Day!',208:'Are You Washed in the Blood?',209:'Grace Greater Than Our Sin',210:'Saved By the Blood',211:'Hallelujah for the Cross!',212:'Nothing But the Blood',213:'The Light of the World Is Jesus',214:'Verily, Verily',215:'Nor Silver nor Gold',216:'Look to the Lamb of God',217:'Jesus, Thy Blood and Righteousness',218:'Burdens Are Lifted at Calvary',219:'Grace! \'Tis a Charming Sound',220:'I\'ll Stand By Until the Morning',221:'Thank You, Lord',222:'There Is a Fountain',223:'Arise, My Soul, Arise!',224:'I Know Whom I Have Believed',225:'I Heard the Voice of Jesus Say',226:'My Savior',227:'The Cleansing Wave',228:'My Faith Has Found a Resting Place',229:'Tell Me the Old, Old Story',230:'Saved, Saved!',231:'Jesus Saves!',232:'When I See the Blood',233:'Depth of Mercy',234:'Wonderful Words of Life',235:'Pass Me Not',236:'Amazing Grace',237:'Why Do You Wait?',238:'O Jesus, Thou Art Standing',239:'Art Thou Weary?',240:'I Am Coming, Lord',241:'Have You Any Room for Jesus?',242:'Jesus, I Come',243:'Room at the Cross for You',244:'Let Jesus Come into Your Heart',245:'I Am Praying for You',246:'Softly and Tenderly',247:'Jesus Is Calling',248:'Why Not Now?',249:'Just As I Am',250:'God\'s Final Call',251:'Almost Persuaded',252:'Only Trust Him',253:'Lord, I\'m Coming Home',254:'Come to the Savior',255:'Blessed Assurance',256:'It Is Well with My Soul',257:'\'Tis So Sweet to Trust in Jesus',258:'He Hideth My Soul',259:'The Rock That Is Higher Than I',260:'Is My Name Written There?',261:'Trust and Obey',262:'Trusting Jesus',263:'A Shelter in the Time of the Storm',264:'In the Garden',265:'We Have an Anchor',266:'Fade, Fade, Each Earthly Joy',267:'All Things Work Out for Good',268:'How Firm a Foundation',269:'Under His Wings',270:'The Haven of Rest',271:'My Anchor Holds',272:'The Solid Rock',273:'Walk in the Light',274:'Jesus Never Fails',275:'I Belong to the King',276:'In the Hour of Trial',277:'O Thou, in Whose Presence',278:'I Am Trusting Thee, Lord Jesus',279:'A Child of the King!',280:'Moment by Moment',281:'Never Alone',282:'Hiding in Thee',283:'Yesterday, Today, Forever',284:'Sweet Peace, the Gift of God\'s Love',285:'Peace, Perfect Peace',286:'Come, Ye Disconsolate',287:'Like a River Glorious',288:'Wonderful Peace',289:'Does Jesus Care?',290:'Be Still, My Soul',291:'Guide Me, O Thou Great Jehovah',292:'Surely Goodness and Mercy',293:'The Lord\'s My Shepherd',294:'Savior, Like a Shepherd Lead Us',295:'He Leadeth Me',296:'All the Way My Savior Leads Me',297:'God Will Take Care of You',298:'God Leads Us Along',299:'Day by Day',300:'More Secure Is No One Ever',301:'The King of Love My Shepherd Is',302:'Lead Me, Savior',303:'Jesus, Savior, Pilot Me',304:'Savior, More Than Life to Me',305:'Just One Step at a Time',306:'A Passion for Souls',307:'I with Thee Would Begin',308:'Higher Ground',309:'Beneath the Cross of Jesus',310:'Whiter Than Snow',311:'We Would See Jesus',312:'O Perfect Love',313:'Stepping in the Light',314:'I Am Thine, O Lord',315:'Deeper and Deeper',316:'O to Be Like Thee!',317:'A Charge to Keep I Have',318:'I Need Thee Every Hour',319:'I Would Be True',320:'O I Want to Be Like Jesus',321:'Nothing Between',322:'Near to Thy Heart',323:'More Love to Thee',324:'A Student\'s Prayer',325:'More Like the Master',326:'More About Jesus',327:'O for a Faith That Will Not Shrink',328:'Close to Thee',329:'Sitting at the Feet of Jesus',330:'Fill All My Vision',331:'Make Me a Channel of Blessing',332:'My Jesus, I Love Thee',333:'May the Mind of Christ, My Savior',334:'Be Thou My Vision',335:'God of Our Youth',336:'O for a Closer Walk with God',337:'Teach Me Thy Way, O Lord',338:'O Grant Thy Touch',339:'O Love That Wilt Not Let Me Go',340:'Nearer, Still Nearer',341:'Something for Thee',342:'Must Jesus Bear the Cross Alone?',343:'I Want a Principle Within',344:'I Must Tell Jesus',345:'\'Tis the Blessed Hour of Prayer',346:'Teach Me to Pray',347:'Tell It to Jesus',348:'The Beautiful Garden of Prayer',349:'There Shall Be Showers of Blessing',350:'Teach Me to Trust',351:'Near the Cross',352:'Jesus, Lover of My Soul',353:'Leave It There',354:'What a Friend We Have in Jesus',355:'From Every Stormy Wind That Blows',356:'Near to the Heart of God',357:'Nearer, My God, to Thee',358:'Dear Lord and Father of Mankind',359:'My Faith Looks Up to Thee',360:'Speak, Lord, in the Stillness',361:'Sweet Hour of Prayer',362:'More Holiness Give Me',363:'Dare to Be a Daniel',364:'Yield Not to Temptation',365:'Are Ye Able, Said the Master',366:'Give Me Thy Heart',367:'His Way with Thee',368:'Have I Done My Best for Jesus?',369:'Give of Your Best to the Master',370:'Count Your Blessings',371:'Let the Lower Lights Be Burning',372:'Who Is on the Lord\'s Side?',373:'You May Have the Joy-Bells',374:'Jesus Calls Us',375:'I Gave My Life for Thee',376:'Take Time to Be Holy',377:'Stand Up for Jesus',378:'Stand Up for Jesus',379:'Fight the Good Fight',380:'Rise Up, O Men of God!',381:'Is Your All on the Altar?',382:'Trust, Try, and Prove Me',383:'Follow, I Will Follow Thee',384:'Where He Leads Me',385:'Take the World, but Give Me Jesus',386:'All for Jesus',387:'True-Hearted, Whole-Hearted',388:'Have Thine Own Way, Lord!',389:'I Am Resolved',390:'Jesus, I My Cross Have Taken',391:'A Flag to Follow',392:'O Jesus, I Have Promised',393:'Take My Life and Let It Be',394:'I Surrender All',395:'Only One Life',396:'I\'ll Live for Him',397:'I Have Decided to Follow Jesus',398:'Follow On',399:'My Heart\'s Prayer',400:'Jesus, and Shall It Ever Be?',401:'Where He Leads I\'ll Follow',402:'Faith Is the Victory',403:'Soldiers of Christ, Arise',404:'The Fight Is On',405:'My Soul, Be on Thy Guard',406:'I\'m a Soldier',407:'Lead On, O King Eternal',408:'Loyalty to Christ',409:'Hold the Fort',410:'The Banner of the Cross',411:'Victory Through Grace',412:'The Son of God Goes Forth to War',413:'Sound the Battle Cry!',414:'Am I a Soldier of the Cross?',415:'Ye Christian Heralds',416:'So Send I You',417:'In Christ There Is No East or West',418:'Must I Go, and Empty-Handed?',419:'The Call for Reapers',420:'Bringing In the Sheaves',421:'Go Tell the Untold Millions',422:'Anywhere with Jesus',423:'We\'ve a Story to Tell',424:'Send the Light!',425:'Seeking the Lost',426:'Throw Out the Life-Line',427:'Go Ye into All the World',428:'To the Work!',429:'Ready',430:'O Zion, Haste',431:'I Love to Tell the Story',432:'Rescue the Perishing',433:'From Greenland\'s Icy Mountains',434:'Hail to the Brightness',435:'Lord, Speak to Me',436:'Bring Them In',437:'O Master, Let Me Walk with Thee',438:'Footsteps of Jesus',439:'Work, for the Night Is Coming',440:'I\'ll Go Where You Want Me to Go',441:'Love Lifted Me',442:'Praise Him! Praise Him!',443:'There Is No Name So Sweet on Earth',444:'There\'s a Wideness in God\'s Mercy',445:'No, Not One!',446:'Satisfied',447:'The Lily of the Valley',448:'He Ransomed Me',449:'To God Be the Glory',450:'Isn\'t the Love of Jesus Something Wonderful!',451:'Wonderful, Wonderful Jesus!',452:'My Savior\'s Love',453:'He Keeps Me Singing',454:'What a Wonderful Savior!',455:'In My Heart There Rings a Melody',456:'He Is So Precious to Me',457:'In My Heart',458:'Ring the Bells of Heaven!',459:'He Lifted Me',460:'Leaning on the Everlasting Arms',461:'O It Is Wonderful!',462:'Sunshine in My Soul',463:'All That Thrills My Soul',464:'I Will Praise Him!',465:'Springs of Living Water',466:'Christ Liveth in Me',467:'Since I Have Been Redeemed',468:'I Will Sing the Wondrous Story',469:'I\'ve Found a Friend',470:'Jesus Is All the World to Me',471:'Love Found a Way',472:'Heavenly Sunlight',473:'Heaven Came Down and Glory Filled My Soul',474:'Only a Sinner',475:'Redeemed',476:'It Is Glory Just to Walk with Him',477:'At Calvary',478:'Constantly Abiding',479:'Jesus Loves Me',480:'In Tenderness He Sought Me',481:'Sunlight',482:'Walking in the Light',483:'O How I Love Jesus',484:'Still Sweeter Every Day',486:'Sweeter as the Years Go By',487:'Now I Belong to Jesus',488:'My Redeemer',489:'Glory to His Name',490:'When Love Shines In',491:'Heavenly Joy Is Ringing',492:'Jesus Loves Even Me',493:'Since the Savior Found Me',494:'It\'s Just Like His Great Love',495:'Unsearchable Riches',496:'Victory in Jesus',497:'When I Can Read My Title Clear',498:'When We All Get to Heaven',499:'I\'ve a Home Beyond the River',500:'When the Roll Is Called Up Yonder',501:'After',502:'My Savior First of All',503:'My Home, Sweet Home',504:'Sweet By and By',505:'O That Will Be Glory',506:'Meet Me There',507:'When We All Get Home',508:'For All the Saints',509:'The Sands of Time Are Sinking',510:'Shall We Gather at the River?',511:'Face to Face',512:'Saved By Grace',513:'He the Pearly Gates Will Open',514:'We\'re Marching to Zion',515:'Beulah Land',516:'I\'m Going Home',517:'On Jordan\'s Stormy Banks',518:'Over the Sunset Mountains',519:'Great God, We Sing That Mighty Hand',520:'Another Year Is Dawning',521:'Where Cross the Crowded Ways of Life',522:'Our Thanks, O God, for Fathers',523:'Happy the Home When God Is There',524:'Gracious Savior, Who Didst Honor',525:'A Christian Home',526:'Come, Ye Thankful People',527:'Thanks to God!',528:'The Star-Spangled Banner',529:'My Country, \'Tis of Thee',530:'Battle Hymn of the Republic',531:'America the Beautiful',532:'God of Our Fathers',533:'We Bid Thee Welcome'};
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
  // show overlay, hide bibleScroll
  var overlay = document.getElementById('hymnsOverlay');
  var scroll = document.getElementById('bibleScroll');
  if(overlay) overlay.style.display = 'flex';
  if(scroll) scroll.style.display = 'none';
  if(typeof _updateBibleBars==='function') _updateBibleBars();
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
  if(overlay) overlay.style.display = 'none';
  if(scroll) scroll.style.display = '';
  if(typeof _updateBibleBars==='function') _updateBibleBars();
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
