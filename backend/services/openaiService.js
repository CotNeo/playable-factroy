/**
 * MERN To-Do Uygulaması (AI Destekli) - OpenAI Servisi
 * 
 * Bu proje Playable Factory şirketi Software Engineer Pozisyonu için
 * Furkan Akar (CotNeo) tarafından hazırlanmıştır.
 * GitHub: https://github.com/CotNeo
 * Web: https://cotneo.com
 * 
 * OpenAI GPT entegrasyonu, görevlere ilişkin öneriler üreten servisi içerir.
 * Bu proje GitHub Copilot desteğiyle Visual Studio Code ortamında geliştirilmiştir.
 * Referans Repolar:
 * - https://github.com/CotNeo/mern-crud
 * - https://github.com/iam-veeramalla/MERN-docker-compose/tree/compose/mern
 */

const { OpenAI } = require('openai');

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate recommendations based on todo title and description
 * @param {string} title - Todo title
 * @param {string} description - Todo description (optional)
 * @returns {Promise<string>} - AI-generated recommendations
 */
async function generateRecommendations(title, description = '') {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.warn('OpenAI API key is not configured. Please set a valid API key in .env file.');
      return "OpenAI API key is not configured. Please set a valid API key in your environment.";
    }

    // Log API key format (ilk 5 karakteri güvenlik için)
    console.log(`Using OpenAI API key format: ${process.env.OPENAI_API_KEY.substring(0, 8)}...`);

    // Kota aşımı testi (Mock öneriler)
    const useLocalRecommendations = false; // Gerçek GPT entegrasyonu kullan
    
    if (useLocalRecommendations) {
      console.log('Using local AI recommendations due to quota limitations');
      return generateLocalRecommendations(title, description);
    }
    
    console.log('Using OpenAI API for recommendations');

    // Create prompt for OpenAI
    const prompt = `Task Title: ${title}
${description ? `Task Description: ${description}\n` : ''}

Lütfen bu görev için 3 adet pratik, uygulanabilir ve spesifik öneri sağlayın. 
Öneriler, görevi daha verimli ve etkili bir şekilde tamamlamaya yardımcı olmalıdır.
Her öneri açık, anlaşılır ve uygulanabilir olmalıdır.
Yanıtınızı Türkçe olarak verin ve her öneriyi kısa ve öz tutun.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sen görev yönetimi konusunda uzmanlaşmış, pratik ve uygulanabilir öneriler sunan bir asistansın. Önerilerin açık, anlaşılır ve kullanıcı dostu olmalı. Tüm önerileri Türkçe olarak sunmalısın."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 350,
      temperature: 0.8,
      presence_penalty: 0.3,
      frequency_penalty: 0.5,
    });

    // Extract and return the recommendations
    const apiResponse = response.choices[0].message.content.trim();
    console.log('OpenAI response received');
    
    // Yanıtı formatla - numaralandırılmış bir liste olmadığında formatla
    if (!apiResponse.match(/^\d+\.\s/m)) {
      const responseLines = apiResponse.split('\n').filter(line => line.trim().length > 0);
      return responseLines.map((line, index) => `${index + 1}. ${line.replace(/^[-*•]\s*/, '')}`).join('\n');
    }
    
    return apiResponse;
  } catch (error) {
    // Detaylı hata ayrıntılarını kaydet
    console.error('OpenAI API error:', error);
    console.error('Error details:');
    
    if (error.response) {
      // API'den gelen hata yanıtı
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı
      console.error('No response received:', error.request);
    } else {
      // İstek yapmadan önce hata oluştu
      console.error('Error message:', error.message);
    }
    
    // Hata türüne göre özelleştirilmiş mesajlar
    if (error.response && error.response.status === 401) {
      console.error('Authentication error with OpenAI API. Using local recommendations instead.');
      return generateLocalRecommendations(title, description);
    } else if (error.response && error.response.status === 429 || (error.message && error.message.includes('quota'))) {
      console.log('Quota exceeded. Using local recommendations instead.');
      return generateLocalRecommendations(title, description);
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('Network error connecting to OpenAI. Using local recommendations instead.');
      return generateLocalRecommendations(title, description);
    } else if (error.message && error.message.includes('Invalid API key')) {
      console.error('Invalid OpenAI API key format. Using local recommendations instead.');
      return generateLocalRecommendations(title, description);
    } else {
      console.error('Unknown error with OpenAI API. Using local recommendations instead.');
      return generateLocalRecommendations(title, description);
    }
  }
}

/**
 * Kota aşımı durumunda yerel öneriler üreten fonksiyon
 * OpenAI API bağlantısı olmadan çalışır, her seferinde rastgele öneriler döndürür
 */
function generateLocalRecommendations(title, description = '') {
  // Görev başlığından ve açıklamadan anahtar kelimeler çıkar
  const titleWords = title.toLowerCase().split(/\s+/);
  const descWords = description ? description.toLowerCase().split(/\s+/) : [];
  const allWords = [...titleWords, ...descWords];
  
  // Önerileri ve kategori tanımını genişletilmiş haliyle tanımla
  const suggestions = {
    default: [
      "Görevi daha küçük, yönetilebilir parçalara bölerek başlayın.",
      "Görev için bir zaman sınırı belirleyin ve bunu takvime ekleyin.",
      "Görevin başarılı bir şekilde tamamlandığını nasıl ölçeceğinizi tanımlayın.",
      "Bu görev için SMART hedefler belirleyin (Specific, Measurable, Achievable, Relevant, Time-bound).",
      "Görevin hangi diğer faaliyetlerle bağlantılı olduğunu belirleyin.",
      "Etkili bir not sistemi kullanarak ilerlemeyi takip edin.",
      "Birini görevin yürütülmesi konusunda hesap verebilirlik ortağı olarak belirleyin.",
      "Görevin öncelik düzeyini belirleyin ve diğer görevlerle nasıl sıralanacağını planlayın.",
      "Gereken tüm kaynakları ve araçları önceden hazırlayın.",
      "Herhangi bir beklenmedik durumla başa çıkmak için bir B planı düşünün."
    ],
    work: [
      "Başlamadan önce net bir odak süresi belirleyin ve dikkat dağıtıcıları ortadan kaldırın.",
      "İlerlemenizi kaydetmek için küçük kilometre taşları belirleyin.",
      "Proje yönetimi aracı kullanarak görevi takip edin (Trello, Asana veya benzer bir araç).",
      "Düzenli kısa molalar planlayarak verimlilik için Pomodoro tekniğini kullanın.",
      "Görev için gereken tüm bilgi ve kaynakları bir araya getirin.",
      "Çalışma alanınızı optimize edin ve dikkat dağıtıcı unsurları ortadan kaldırın.",
      "İş akışını analiz ederek otomatikleştirilebilecek bölümleri belirleyin.",
      "Süreçleri standartlaştırarak tutarlılığı artırın.",
      "Yöneticinizle görevin kapsamını ve beklentileri netleştirin.",
      "Gerektiğinde yardım istemekten çekinmeyin, takım çalışması verimliliği artırabilir.",
      "Kişisel iş performansınızı ölçmeniz için metrikler belirleyin.",
      "Görevi tamamlamak için ihtiyaç duyacağınız tüm paydaşları belirleyin."
    ],
    meeting: [
      "Bir ajanda oluşturun ve toplantıdan önce herkesle paylaşın.",
      "Toplantı sırasında notlar alın veya kaydedin.",
      "Toplantı sonrası eylemleri ve kararları belirleyin ve katılımcılara dağıtın.",
      "Toplantı süresini net bir şekilde belirleyin ve bu süreye sadık kalın.",
      "Önemli katılımcıların hazır bulunduğundan emin olun.",
      "Toplantıda kullanılacak tüm belgeleri veya sunumları önceden hazırlayın.",
      "Katılımcılara yeterli konuşma fırsatı verirken toplantıyı konu odaklı tutun.",
      "Toplantı için ideal bir ortam seçin veya çevrimiçi toplantı için teknik hazırlık yapın.",
      "Toplantı sonrasında bir değerlendirme yaparak gelecekteki toplantılarınızı iyileştirin.",
      "Katılımcıların katkılarını ve fikirlerini teşvik eden sorular hazırlayın."
    ],
    shopping: [
      "Satın almak istediğiniz tüm öğelerin bir listesini çıkarın.",
      "Fiyat karşılaştırması yaparak en iyi anlaşmayı bulun.",
      "Bütçe sınırınızı önceden belirleyin ve buna bağlı kalın.",
      "İndirim kuponları veya promosyon kodları arayın.",
      "Online alışveriş yapıyorsanız kargo ücretlerini ve teslimat sürelerini kontrol edin.",
      "Alacağınız ürünler hakkında kullanıcı yorumlarını ve değerlendirmelerini okuyun.",
      "İhtiyaç ve istekleri önceliklendirerek liste oluşturun.",
      "Ürünlerin garanti ve iade politikalarını inceleyin.",
      "Büyük alışverişler için en uygun zamanı (örn. sezon sonu indirimleri) bekleyin.",
      "Çevresel etkiyi düşünerek sürdürülebilir ürünleri tercih etmeyi düşünün.",
      "Alışveriş sırasında anlık kararlardan kaçının, planlı hareket edin."
    ],
    learning: [
      "Konuyu küçük, yönetilebilir bölümlere ayırın.",
      "Anladığınızı test etmek için pratik yapın veya kendinizi test edin.",
      "Pomodoro tekniği kullanarak çalışın: 25 dakika çalışın, 5 dakika ara verin.",
      "Aktif öğrenme yöntemleri kullanın: konuyu başkasına anlatın veya notlar alın.",
      "Öğrenme hedeflerinizi ve sürecini izleyin.",
      "Farklı kaynaklar kullanarak öğrenme materyallerini çeşitlendirin.",
      "Öğrenmek istediğiniz konuyla ilgili pratik uygulamalar yapın.",
      "Çalışma zamanlarınızı, en verimli olduğunuz saatlere göre planlayın.",
      "Görselleştirme ve zihin haritaları gibi yöntemler kullanarak bilgiyi organize edin.",
      "Yeni öğrendiğiniz bilgileri daha önce öğrendiklerinizle ilişkilendirin.",
      "Bilgiyi kendi kelimelerinizle özetleyin ve açıklayın.",
      "Çalışma arkadaşları bularak grup çalışması veya bilgi paylaşımı yapın."
    ],
    fitness: [
      "Başlamadan önce kısa bir ısınma yapın, bitince de soğuma egzersizleri yapın.",
      "İlerlemenizi izlemek için bir fitness uygulaması kullanın.",
      "Hedeflerinizi SMART (Specific, Measurable, Achievable, Relevant, Time-bound) olarak tanımlayın.",
      "Egzersiz programınızı çeşitlendirerek farklı kas gruplarını çalıştırın.",
      "Aktiviteler arasında yeterli dinlenme süresi planlayın.",
      "Doğru teknikleri öğrenmek için videolar izleyin veya bir eğitmene danışın.",
      "Beslenme planınızı fitness hedeflerinize uygun şekilde düzenleyin.",
      "Aktivite öncesi ve sonrası yeterli su tüketin.",
      "Kıyafet ve ekipmanlarınızın aktiviteye uygun olduğundan emin olun.",
      "Düzenli antrenmanı alışkanlık haline getirmek için bir program oluşturun.",
      "Hedeflere ulaşmak için kademeli zorluk artışı planlayın.",
      "Antrenman günlüğü tutarak ilerlemenizi ve hislerinizi kaydedin."
    ],
    email: [
      "E-postanın konusunu ve ana noktalarını önceden taslak olarak yazın.",
      "Kısa ve öz olun, gerektiğinde madde işaretleri kullanın.",
      "Göndermeden önce yazım hatalarını kontrol edin ve bir kez daha gözden geçirin.",
      "Konuyla ilgili belge veya dosyaları hazırlayın ve doğru şekilde ekleyin.",
      "Önemli noktaları vurgulamak için gerektiğinde kalın veya italik formatı kullanın.",
      "Alıcıların e-posta adreslerini doğru gruplandırın (kime, cc, bcc).",
      "E-postanın amacını net bir şekilde belirtin.",
      "Profesyonel bir ton ve dil kullanın, bağlama uygun hitap şekli seçin.",
      "Yanıt bekliyorsanız, net bir son tarih veya takip planı belirtin.",
      "İmza bölümünüzü profesyonel bilgilerle güncelleyin.",
      "E-posta gönderimi için en uygun zamanı seçin."
    ],
    coding: [
      "Kodlamaya başlamadan önce problemi tam olarak anlayın ve gerekirse not alın.",
      "Çözüme başlamadan önce temel algoritma veya yaklaşım planınızı belirleyin.",
      "Karmaşık problemleri küçük, yönetilebilir alt görevlere bölerek ilerleyin.",
      "Yardımcı kaynaklara başvurmaktan çekinmeyin: dokümantasyon, Stack Overflow, GitHub.",
      "Kod yazdıkça düzenli olarak test yapın, hataları erken tespit edin.",
      "Kodunuzu anlamlı yorumlarla açıklayın ve okunabilir tutun.",
      "Versiyonlama sistemi (Git gibi) kullanarak değişikliklerinizi düzenli olarak kaydedin.",
      "Kod derleme zamanını azaltmak için kodunuzu optimize etmeyi düşünün.",
      "Yeniden kullanılabilir kod parçaları için fonksiyonlar veya sınıflar oluşturun.",
      "Sürekli aynı hataları yapıyorsanız, hızlı referans için bir not listesi tutun.",
      "Karmaşık mantık için önce sözde kod (pseudocode) yazın.",
      "Sorunları çözmek için debugging araçlarını etkin kullanın."
    ],
    writing: [
      "Yazmaya başlamadan önce ana fikri ve hedef kitlenizi belirleyin.",
      "İçeriğinizi planlamak için bir taslak oluşturun.",
      "Dikkat dağıtıcı unsurlardan arındırılmış bir yazma ortamı hazırlayın.",
      "Düzenli aralıklarla yazdıklarınızı okuyarak içeriği gözden geçirin.",
      "Cümlelerinizi çeşitlendirerek metni daha ilgi çekici hale getirin.",
      "Aktif cümle yapısını tercih edin ve gereksiz kelimelerden kaçının.",
      "Yazım ve dilbilgisi kontrolü yapın, gerekirse yardımcı araçlar kullanın.",
      "Yazınızda düşüncelerinizi desteklemek için örnekler ve veriler ekleyin.",
      "Giriş, gelişme ve sonuç bölümlerinin mantıksal bir akışla bağlandığından emin olun.",
      "İlk taslağı tamamladıktan sonra yazıyı bir süre bekletin ve taze bir gözle yeniden okuyun.",
      "Yazınızı başkalarına okutarak geri bildirim almaktan çekinmeyin.",
      "Yazınızın uzunluğunu ve tarzını hedef kitlenize uygun olacak şekilde ayarlayın."
    ],
    cooking: [
      "Yemek yapmadan önce tarifi dikkatle okuyun ve tüm malzemeleri hazırlayın (mise en place).",
      "Gerekli tüm araç-gereçleri çıkarın ve çalışma alanınızı düzenleyin.",
      "Tarifi takip ederken zamanlamaya dikkat edin.",
      "Farklı pişirme teknikleri ve tarifleri deneyerek becerilerinizi geliştirin.",
      "Keskin bir bıçak kullanarak kesme işlemlerini daha güvenli ve hızlı yapın.",
      "Taze malzemeler kullanarak yemeğin lezzetini artırın.",
      "Ölçüleri doğru kullanarak yemeklerde tutarlı sonuçlar elde edin.",
      "Sık kullanılan baharat ve sos kombinasyonlarını öğrenerek lezzeti zenginleştirin.",
      "Artan malzemeleri değerlendirerek israfı önleyin.",
      "Pişirme sıcaklıklarını kontrol ederek yemeğin yanmasını veya çiğ kalmasını önleyin.",
      "Yemek yaparken temizliğe dikkat edin, kullandıkça temizleyin.",
      "Besin değeri yüksek yemekler hazırlamak için çeşitli malzemeler kullanın."
    ],
    design: [
      "Tasarıma başlamadan önce hedef kitleyi ve amacı net bir şekilde tanımlayın.",
      "Renk şemasını, tipografiyi ve görsel öğeleri hedef kitleye uygun seçin.",
      "İlham için benzer projeler ve güncel tasarım trendlerini inceleyin.",
      "Kullanıcı deneyimini ön planda tutarak sezgisel ve kullanışlı tasarımlar oluşturun.",
      "Tasarım sürecini taslak, detaylandırma ve ince ayar olarak aşamalara bölün.",
      "Geri bildirim alarak tasarımınızı sürekli geliştirin.",
      "Tasarımınızın farklı ekran boyutlarında nasıl görüneceğini test edin (responsive design).",
      "Tutarlı bir görsel dil kullanarak marka kimliğini güçlendirin.",
      "Boşluk, hizalama ve gruplama ilkelerini kullanarak görsel düzen oluşturun.",
      "Dosyalarınızı düzenli tutun ve isimlendirme kurallarına uyun.",
      "Görsel hiyerarşi ilkelerini uygulayarak önemli öğeleri vurgulayın.",
      "Erişilebilirlik standartlarını göz önünde bulundurarak kapsayıcı tasarımlar yapın."
    ],
    travel: [
      "Seyahat öncesi hedef bölge hakkında araştırma yapın.",
      "Pasaport, vize ve gerekli belgeleri kontrol edin.",
      "Konaklama ve ulaşım için erken rezervasyon yaparak tasarruf edin.",
      "Gideceğiniz yerin hava durumuna göre kıyafet ve ekipman hazırlayın.",
      "Önemli belgelerinizin dijital kopyalarını saklayın.",
      "Yerel para birimi hakkında bilgi edinip, döviz değişimi için plan yapın.",
      "Acil durumlar için temel ilaçları ve ilk yardım malzemelerini yanınıza alın.",
      "Gideceğiniz yerin yerel kültürü ve kuralları hakkında bilgi edinin.",
      "Ziyaret etmek istediğiniz yerler için bir öncelik listesi oluşturun.",
      "Yolculuk için rahat kıyafetler ve ayakkabılar tercih edin.",
      "Telefon, kamera gibi elektronik cihazlarınız için şarj aletleri ve adaptörler alın.",
      "Seyahat sigortası yaptırmayı değerlendirin."
    ]
  };
  
  // Anahtar kelimelere göre kategorileri eşleştir
  const keywordToCategory = {
    // İş ve proje ile ilgili
    work: 'work', iş: 'work', proje: 'work', project: 'work', report: 'work', rapor: 'work',
    deadline: 'work', sunum: 'work', iş: 'work', görev: 'work', task: 'work', office: 'work',
    
    // Toplantı ile ilgili
    meeting: 'meeting', toplantı: 'meeting', presentation: 'meeting', sunum: 'meeting', 
    konferans: 'meeting', webinar: 'meeting', görüşme: 'meeting', seminer: 'meeting',
    
    // Alışveriş ile ilgili
    buy: 'shopping', alışveriş: 'shopping', market: 'shopping', shopping: 'shopping', 
    satın: 'shopping', sipariş: 'shopping', mağaza: 'shopping', indirim: 'shopping',
    
    // Öğrenme ile ilgili
    learn: 'learning', öğren: 'learning', study: 'learning', çalış: 'learning', ders: 'learning',
    eğitim: 'learning', okul: 'learning', kurs: 'learning', ödev: 'learning', homework: 'learning',
    
    // Fitness ile ilgili
    exercise: 'fitness', egzersiz: 'fitness', workout: 'fitness', run: 'fitness', koş: 'fitness',
    spor: 'fitness', yürüyüş: 'fitness', gym: 'fitness', antrenman: 'fitness', training: 'fitness',
    
    // E-posta ile ilgili
    email: 'email', mail: 'email', eposta: 'email', mesaj: 'email', yazışma: 'email',
    
    // Kodlama ile ilgili
    code: 'coding', coding: 'coding', program: 'coding', yazılım: 'coding', development: 'coding',
    geliştirme: 'coding', bug: 'coding', hata: 'coding', test: 'coding', programlama: 'coding',
    
    // Yazı yazma ile ilgili
    write: 'writing', yazı: 'writing', makale: 'writing', blog: 'writing', kitap: 'writing',
    metin: 'writing', yaz: 'writing', içerik: 'writing', content: 'writing', 
    
    // Yemek yapma ile ilgili
    cook: 'cooking', yemek: 'cooking', tarif: 'cooking', recipe: 'cooking', mutfak: 'cooking',
    pişir: 'cooking', hazırla: 'cooking', kitchen: 'cooking', meal: 'cooking',
    
    // Tasarım ile ilgili
    design: 'design', tasarım: 'design', grafik: 'design', logo: 'design', ui: 'design',
    ux: 'design', çizim: 'design', illustration: 'design', illustrasyon: 'design',
    
    // Seyahat ile ilgili
    travel: 'travel', seyahat: 'travel', gezi: 'travel', tatil: 'travel', tur: 'travel',
    trip: 'travel', holiday: 'travel', vacation: 'travel', plan: 'travel'
  };
  
  // Anahtar kelimelerden kategori belirle
  let category = 'default';
  let matchedKeywords = 0;
  
  // Tüm kelimelerde anahtar kelime eşleşmesi ara
  allWords.forEach(word => {
    if (keywordToCategory[word]) {
      // Her eşleşmeyi say ve en çok eşleşen kategoriyi seç
      const matchedCategory = keywordToCategory[word];
      const categoryMatchCount = allWords.filter(w => 
        keywordToCategory[w] === matchedCategory
      ).length;
      
      if (categoryMatchCount > matchedKeywords) {
        category = matchedCategory;
        matchedKeywords = categoryMatchCount;
      }
    }
  });
  
  // İçerik bazlı daha ileri kategori belirleme
  // Özel karakter kombinasyonları veya anlamlı ifadeler arayabilirsiniz
  if (description.includes("@") || title.toLowerCase().includes("mail")) {
    category = 'email';
  }
  else if (title.match(/\b(html|css|js|api|kod|bug)\b/i) || description.match(/\b(kod|program|bug|test|json|api)\b/i)) {
    category = 'coding';
  }
  
  // Önerileri rastgele seç - her seferinde farklı önerileri göstermek için
  const allSuggestions = suggestions[category];
  const numSuggestions = Math.min(3, allSuggestions.length); // 3 öneri seç
  const randomSuggestions = [];
  
  // Rastgele 3 benzersiz öneri seç
  const shuffledIndices = Array.from({length: allSuggestions.length}, (_, i) => i)
    .sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < numSuggestions; i++) {
    randomSuggestions.push(allSuggestions[shuffledIndices[i]]);
  }
  
  // Önerileri formatla (numaralandır)
  return randomSuggestions.map((suggestion, index) => 
    `${index + 1}. ${suggestion}`
  ).join('\n');
}

module.exports = { generateRecommendations }; 