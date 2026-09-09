/*
  Celý skript čekáme na "DOMContentLoaded".
  PROČ: Kdybychom skript spustili hned, prohlížeč by ještě nemusel mít
  načtené HTML elementy (např. #header, #nav...) a getElementById by vracel null.
  Díky tomuto eventu máme jistotu, že celá stránka (DOM) je already sestavená.
*/
document.addEventListener('DOMContentLoaded', () => {

  /* ===========================================================
     1) MOBILNÍ MENU (HAMBURGER)
     =========================================================== */

  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  hamburger.addEventListener('click', () => {
    /*
      Používáme classList.toggle() místo ručního nastavování stylu (style.display).
      PROČ: Necháváme veškerý vzhled (jak menu vypadá otevřené/zavřené) v CSS souboru.
      JS se tak stará jen o LOGIKU (kdy má být menu otevřené), ne o vzhled.
      To usnadňuje pozdější úpravy designu bez zásahu do JS.
    */
    nav.classList.toggle('nav--otevrene');
    hamburger.classList.toggle('hamburger--aktivni');

    /*
      aria-expanded aktualizujeme kvůli přístupnosti (accessibility).
      PROČ: Čtečky obrazovky pro nevidomé uživatele díky tomu poznají,
      jestli je menu momentálně rozbalené, nebo ne.
    */
    const jeOtevrene = nav.classList.contains('nav--otevrene');
    hamburger.setAttribute('aria-expanded', jeOtevrene);
  });

  /*
    Po kliknutí na jakýkoliv odkaz v menu (na mobilu) menu zase zavřeme.
    PROČ: Bez toho by uživateli po kliknutí na "Kontakt" zůstalo menu
    přes celou obrazovku a musel by ho ručně zavírat - to je špatný UX.
  */
  const navOdkazy = document.querySelectorAll('.nav__link');
  navOdkazy.forEach((odkaz) => {
    odkaz.addEventListener('click', () => {
      nav.classList.remove('nav--otevrene');
      hamburger.classList.remove('hamburger--aktivni');
    });
  });


  /* ===========================================================
     2) ZMĚNA VZHLEDU HLAVIČKY PŘI SCROLLOVÁNÍ
     =========================================================== */

  const header = document.getElementById('header');
  const tlacitkoNahoru = document.getElementById('nahoruBtn');

  /*
    Posluchač na scroll dáváme na "window", protože scrollujeme celou stránkou,
    ne jen jedním konkrétním elementem.
  */
  window.addEventListener('scroll', () => {
    /*
      Podmínka window.scrollY > 50 znamená "uživatel odscrolloval alespoň 50px".
      PROČ zrovna 50px: Kdybychom třídu přidávali hned při scrollY > 0,
      hlavička by "blikala" i při sebemenším nechtěném posunu kolečkem myši.
      Malá tolerance dělá chování stabilnější a příjemnější.
    */
    if (window.scrollY > 50) {
      header.classList.add('header--scrolled');
      tlacitkoNahoru.classList.add('viditelne');
    } else {
      header.classList.remove('header--scrolled');
      tlacitkoNahoru.classList.remove('viditelne');
    }
  });

  /*
    Kliknutí na tlačítko "nahoru" plynule odscrolluje na začátek stránky.
    PROČ scrollTo s behavior: 'smooth': Bez tohoto parametru by stránka
    "skočila" nahoru okamžitě, což působí neprofesionálně. S "smooth"
    prohlížeč sám vytvoří plynulou animaci.
  */
  tlacitkoNahoru.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* ===========================================================
     3) DYNAMICKÉ VYTVOŘENÍ GALERIE
     =========================================================== */

  /*
    Data o obrázcích držíme v poli objektů, ne přímo napsaná v HTML.
    PROČ: Když jsou data oddělená od struktury (HTML), stačí v budoucnu
    upravit jen toto pole (např. napojit na databázi nebo API) a галerie
    se automaticky přegeneruje - nemusíme ručně kopírovat <div> bloky v HTML.
    Zde používáme placeholder.com jen jako ukázková data - klidně nahraď
    vlastními fotkami ve složce /images.
  */
  const fotkyGalerie = [
    { zdroj: 'https://placehold.co/400x400/c98a6b/ffffff?text=Strih+1', popis: 'Ukázka dámského střihu' },
    { zdroj: 'https://placehold.co/400x400/a86a4d/ffffff?text=Barveni+1', popis: 'Ukázka barvení' },
    { zdroj: 'https://placehold.co/400x400/2b2320/ffffff?text=Styling+1', popis: 'Ukázka stylingu' },
    { zdroj: 'https://placehold.co/400x400/c98a6b/ffffff?text=Strih+2', popis: 'Ukázka pánského střihu' },
    { zdroj: 'https://placehold.co/400x400/a86a4d/ffffff?text=Barveni+2', popis: 'Ukázka melíru' },
    { zdroj: 'https://placehold.co/400x400/2b2320/ffffff?text=Pece', popis: 'Ukázka péče o vlasy' },
  ];

  const galerieGrid = document.getElementById('galerieGrid');

  /*
    Používáme document.createElement + appendChild místo innerHTML +=.
    PROČ: Opakované přičítání do innerHTML (innerHTML += ...) v cyklu
    je pomalé, protože prohlížeč musí pokaždé znovu parsovat celý HTML
    řetězec. Vytváření elementů přes JS objekty je rychlejší a bezpečnější
    (nehrozí náhodné vložení "rozbitého" HTML).
  */
  fotkyGalerie.forEach((fotka) => {
    const polozka = document.createElement('div');
    polozka.classList.add('galerie__polozka');

    const obrazek = document.createElement('img');
    obrazek.src = fotka.zdroj;
    obrazek.alt = fotka.popis;
    /*
      loading="lazy" řekne prohlížeči, ať obrázek stáhne až ve chvíli,
      kdy se blíží k viewportu (viditelné části obrazovky).
      PROČ: Stránka se díky tomu načte rychleji, protože se nestahují
      hned všechny obrázky galerie, ale jen ty, které uživatel skutečně uvidí.
    */
    obrazek.loading = 'lazy';

    polozka.appendChild(obrazek);
    galerieGrid.appendChild(polozka);
  });


  /* ===========================================================
     4) VALIDACE REZERVAČNÍHO FORMULÁŘE
     =========================================================== */

  const form = document.getElementById('rezervaceForm');
  const potvrzeniText = document.getElementById('potvrzeni');

  /*
    Objekt pravidel pro validaci - klíč odpovídá "name" atributu inputu.
    PROČ takto: Díky společné funkci níže nemusíme psát 5x skoro stejný
    kód (if prázdné -> chyba, if špatný formát -> chyba...). Stačí přidat
    nový záznam do tohoto objektu a validace bude fungovat i pro nové pole.
  */
  const pravidla = {
    jmeno: {
      povinne: true,
      test: (hodnota) => hodnota.trim().length >= 3,
      zprava: 'Zadejte prosím celé jméno (alespoň 3 znaky).',
    },
    telefon: {
      povinne: true,
      /*
        Regulární výraz povoluje číslice, mezery a volitelně "+" na začátku.
        PROČ takto volný regex: Telefonní čísla se zapisují různě
        (+420 601 234 567, 601234567...) a nechceme uživatele zbytečně
        omezovat na jeden přesný formát.
      */
      test: (hodnota) => /^\+?[0-9\s]{9,15}$/.test(hodnota.trim()),
      zprava: 'Zadejte platné telefonní číslo.',
    },
    email: {
      povinne: true,
      test: (hodnota) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hodnota.trim()),
      zprava: 'Zadejte platnou e-mailovou adresu.',
    },
    sluzba: {
      povinne: true,
      test: (hodnota) => hodnota !== '',
      zprava: 'Vyberte prosím jednu ze služeb.',
    },
    datum: {
      povinne: true,
      /*
        Kontrolujeme, že vybrané datum není v minulosti.
        PROČ: Nemá smysl, aby si klient rezervoval termín "včera".
        Datum z inputu porovnáváme s dnešním dnem nastaveným na půlnoc,
        aby fungovala i rezervace na dnešní den.
      */
      test: (hodnota) => {
        if (!hodnota) return false;
        const vybraneDatum = new Date(hodnota);
        const dnes = new Date();
        dnes.setHours(0, 0, 0, 0);
        return vybraneDatum >= dnes;
      },
      zprava: 'Vyberte prosím dnešní nebo budoucí datum.',
    },
  };

  /*
    Funkce zvaliduje jedno konkrétní pole a rovnou vypíše/schová chybovou hlášku.
    PROČ samostatná funkce: Validaci potřebujeme spustit jak při odeslání
    formuláře, tak průběžně při psaní (níže), takže logiku píšeme jen jednou.
  */
  function zvalidujPole(input) {
    const pravidlo = pravidla[input.name];
    if (!pravidlo) return true; // pole bez pravidla (např. poznámka) je vždy v pořádku

    const chybovaZprava = document.getElementById(`chyba-${input.name}`);
    const jeValidni = pravidlo.test(input.value);

    if (!jeValidni) {
      input.classList.add('chyba-pole');
      chybovaZprava.textContent = pravidlo.zprava;
    } else {
      input.classList.remove('chyba-pole');
      chybovaZprava.textContent = '';
    }

    return jeValidni;
  }

  /*
    Na každé pole s pravidlem navěsíme kontrolu při události "blur"
    (tj. ve chvíli, kdy uživatel pole opustí, např. přejde tabulátorem dál).
    PROČ "blur", a ne "input" (při každém stisku klávesy): Kdybychom
    validovali při každém písmenku, uživatel by viděl chybu "Zadejte
    platný e-mail" už po napsání prvního písmene - to je rušivé a nepříjemné.
    Validace až po opuštění pole je běžný a uživatelsky přívětivější přístup.
  */
  Object.keys(pravidla).forEach((nazevPole) => {
    const input = form.elements[nazevPole];
    input.addEventListener('blur', () => zvalidujPole(input));
  });

  /*
    Odeslání formuláře zachytáváme vlastní funkcí a voláme event.preventDefault().
    PROČ: Výchozí chování <form> je poslat data na server a znovu načíst
    stránku. To tady nechceme, protože nemáme backend server - místo toho
    chceme zobrazit vlastní potvrzovací hlášku bez opuštění stránky.
  */
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    /*
      Projdeme všechna pole s pravidlem a zvalidujeme je najednou.
      Používáme .every(), aby se cyklus nezastavil po první chybě
      a uživatel hned viděl VŠECHNA pole, která je potřeba opravit.
    */
    const vsechnaPolePlatna = Object.keys(pravidla)
      .map((nazevPole) => zvalidujPole(form.elements[nazevPole]))
      .every((vysledek) => vysledek === true);

    if (!vsechnaPolePlatna) {
      potvrzeniText.style.color = '#e6a68f';
      potvrzeniText.textContent = 'Zkontrolujte prosím vyznačená pole.';
      return; // dál nepokračujeme, dokud nejsou všechna pole v pořádku
    }

    /*
      V reálném provozu by zde bylo odeslání dat na server, např. přes fetch().
      Zde jen simulujeme úspěšné odeslání, protože stránka je čistě
      klientská (bez backendu). Formulář vyčistíme metodou reset(),
      aby byl formulář připravený na další rezervaci.
    */
    const jmenoKlienta = form.elements['jmeno'].value.trim();
    potvrzeniText.style.color = '#9fd8a3';
    potvrzeniText.textContent = `Děkujeme, ${jmenoKlienta}! Vaše rezervace byla odeslána, brzy se vám ozveme.`;

    form.reset();
  });

  /*
    Minimální povolené datum v poli "datum" nastavíme na dnešek přes JS.
    PROČ přes JS a ne natvrdo v HTML: Kdybychom datum napsali napevno
    do HTML (min="2026-09-09"), za den by bylo neaktuální. Takto se
    "dnešek" vždy spočítá automaticky podle toho, kdy si stránku uživatel otevře.
  */
  const inputDatum = document.getElementById('datum');
  const dnes = new Date().toISOString().split('T')[0]; // formát YYYY-MM-DD, který <input type="date"> vyžaduje
  inputDatum.setAttribute('min', dnes);


  /* ===========================================================
     5) SLIDER S RECENZEMI
     =========================================================== */

  const track = document.getElementById('recenzeTrack');
  const karty = track.children;
  const sipkaVlevo = document.getElementById('sipkaVlevo');
  const sipkaVpravo = document.getElementById('sipkaVpravo');

  let aktualniIndex = 0;

  /*
    Posun slideru řešíme přes CSS "transform: translateX()", ne přes
    zobrazování/skrývání karet (display: none/block).
    PROČ: transform je pro prohlížeč mnohem levnější na výkon (nevyvolává
    tzv. "reflow" celé stránky) a navíc díky "transition" v CSS získáme
    zadarmo plynulou animaci posunu mezi recenzemi.
  */
  function zobrazRecenzi(index) {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  sipkaVpravo.addEventListener('click', () => {
    /*
      Modulo (%) zajišťuje "kolotoč" - po poslední recenzi se plynule
      vrátíme na tu úplně první, místo aby nastala chyba (index mimo pole).
    */
    aktualniIndex = (aktualniIndex + 1) % karty.length;
    zobrazRecenzi(aktualniIndex);
  });

  sipkaVlevo.addEventListener('click', () => {
    /*
      Přičtení karty.length před modulem řeší situaci, kdy by výsledek
      (0 - 1) byl -1. V JavaScriptu je -1 % 3 rovno -1 (ne 2, jak bychom
      čekali z matematiky), takže bez tohoto triku by se slider "zasekl".
    */
    aktualniIndex = (aktualniIndex - 1 + karty.length) % karty.length;
    zobrazRecenzi(aktualniIndex);
  });

  /*
    Automatické posouvání recenzí co 6 sekund pomocí setInterval.
    PROČ: I bez aktivního klikání uživatele tak sekce s recenzemi "žije"
    a ukáže postupně všechny reference, což zvyšuje šanci, že si je
    návštěvník všimne a přečte.
  */
  setInterval(() => {
    aktualniIndex = (aktualniIndex + 1) % karty.length;
    zobrazRecenzi(aktualniIndex);
  }, 6000);


  /* ===========================================================
     6) AKTUÁLNÍ ROK V PATIČCE
     =========================================================== */

  /*
    Rok do patičky (© 2026 ...) doplňujeme automaticky přes JS.
    PROČ: Kdyby byl rok napsaný napevno v HTML, museli bychom si
    každý Nový rok pamatovat, že ho jdeme ručně přepsat v kódu.
    new Date().getFullYear() vrátí vždy aktuální rok podle systému uživatele.
  */
  document.getElementById('rok').textContent = new Date().getFullYear();

});
