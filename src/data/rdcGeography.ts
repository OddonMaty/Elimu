export interface RdcProvince {
  name: string;
  code: string;
  capital: string; // Chef-lieu
  secondCity: string; // 2ème ville principale
  otherTowns?: string[];
  educationProvinces: string[];
}

export const RDC_26_PROVINCES: RdcProvince[] = [
  {
    name: 'Kinshasa',
    code: 'KIN',
    capital: 'Kinshasa (Gombe)',
    secondCity: 'Kinshasa (Limete)',
    otherTowns: ['Ngaliema', 'Kalamu', 'Kisenso', 'Nsele', 'Mont-Ngafula'],
    educationProvinces: ['Kinshasa-Lukunga', 'Kinshasa-Mont Amba', 'Kinshasa-Tshangu', 'Kinshasa-Funa']
  },
  {
    name: 'Haut-Katanga',
    code: 'HK',
    capital: 'Lubumbashi',
    secondCity: 'Likasi',
    otherTowns: ['Kasumbalesa', 'Kipushi', 'Kambove'],
    educationProvinces: ['Haut-Katanga 1 (Lubumbashi)', 'Haut-Katanga 2 (Likasi)']
  },
  {
    name: 'Lualaba',
    code: 'LUA',
    capital: 'Kolwezi',
    secondCity: 'Kasaji',
    otherTowns: ['Fungurume', 'Mutshatsha', 'Dilolo'],
    educationProvinces: ['Lualaba 1 (Kolwezi)', 'Lualaba 2']
  },
  {
    name: 'Haut-Lomami',
    code: 'HL',
    capital: 'Kamina',
    secondCity: 'Bukama',
    otherTowns: ['Kabongo', 'Kaniama', 'Malemba-Nkulu'],
    educationProvinces: ['Haut-Lomami 1', 'Haut-Lomami 2']
  },
  {
    name: 'Tanganyika',
    code: 'TAN',
    capital: 'Kalemie',
    secondCity: 'Kongolo',
    otherTowns: ['Manono', 'Moba', 'Nyunzu', 'Kabalo'],
    educationProvinces: ['Tanganyika 1 (Kalemie)', 'Tanganyika 2']
  },
  {
    name: 'Nord-Kivu',
    code: 'NK',
    capital: 'Goma',
    secondCity: 'Butembo',
    otherTowns: ['Beni', 'Oicha', 'Rutshuru', 'Masisi', 'Walikale'],
    educationProvinces: ['Nord-Kivu 1 (Goma)', 'Nord-Kivu 2 (Butembo-Beni)', 'Nord-Kivu 3']
  },
  {
    name: 'Sud-Kivu',
    code: 'SK',
    capital: 'Bukavu',
    secondCity: 'Uvira',
    otherTowns: ['Baraka', 'Kamituga', 'Shabunda', 'Walungu', 'Kalehe'],
    educationProvinces: ['Sud-Kivu 1 (Bukavu)', 'Sud-Kivu 2 (Uvira)', 'Sud-Kivu 3']
  },
  {
    name: 'Maniema',
    code: 'MAN',
    capital: 'Kindu',
    secondCity: 'Kasongo',
    otherTowns: ['Kalima', 'Kabambare', 'Punia'],
    educationProvinces: ['Maniema 1 (Kindu)', 'Maniema 2']
  },
  {
    name: 'Ituri',
    code: 'ITU',
    capital: 'Bunia',
    secondCity: 'Aru',
    otherTowns: ['Mahagi', 'Mambasa', 'Djugu', 'Irumu'],
    educationProvinces: ['Ituri 1 (Bunia)', 'Ituri 2', 'Ituri 3']
  },
  {
    name: 'Haut-Uele',
    code: 'HU',
    capital: 'Isiro',
    secondCity: 'Watsa',
    otherTowns: ['Dungu', 'Rungu', 'Niangara', 'Faradje'],
    educationProvinces: ['Haut-Uele 1 (Isiro)', 'Haut-Uele 2']
  },
  {
    name: 'Bas-Uele',
    code: 'BU',
    capital: 'Buta',
    secondCity: 'Aketi',
    otherTowns: ['Bambesa', 'Bondo', 'Poko', 'Ango'],
    educationProvinces: ['Bas-Uele 1', 'Bas-Uele 2']
  },
  {
    name: 'Tshopo',
    code: 'TSH',
    capital: 'Kisangani',
    secondCity: 'Yangambi',
    otherTowns: ['Banalia', 'Basoko', 'Opala', 'Ubundu', 'Isangi'],
    educationProvinces: ['Tshopo 1 (Kisangani)', 'Tshopo 2']
  },
  {
    name: 'Équateur',
    code: 'EQU',
    capital: 'Mbandaka',
    secondCity: 'Bikoro',
    otherTowns: ['Basankusu', 'Bolomba', 'Bomongo', 'Ingende'],
    educationProvinces: ['Équateur 1 (Mbandaka)', 'Équateur 2']
  },
  {
    name: 'Sud-Ubangi',
    code: 'SU',
    capital: 'Gemena',
    secondCity: 'Zongo',
    otherTowns: ['Kungu', 'Libenge', 'Budjala'],
    educationProvinces: ['Sud-Ubangi 1 (Gemena)', 'Sud-Ubangi 2']
  },
  {
    name: 'Nord-Ubangi',
    code: 'NU',
    capital: 'Gbadolite',
    secondCity: 'Businga',
    otherTowns: ['Mobayi-Mbongo', 'Yakoma', 'Bosobolo'],
    educationProvinces: ['Nord-Ubangi 1', 'Nord-Ubangi 2']
  },
  {
    name: 'Mongala',
    code: 'MON',
    capital: 'Lisala',
    secondCity: 'Bumba',
    otherTowns: ['Bongandanga'],
    educationProvinces: ['Mongala 1 (Lisala)', 'Mongala 2 (Bumba)']
  },
  {
    name: 'Tshuapa',
    code: 'TSU',
    capital: 'Boende',
    secondCity: 'Ikela',
    otherTowns: ['Befale', 'Bokungu', 'Djolu', 'Monkoto'],
    educationProvinces: ['Tshuapa 1', 'Tshuapa 2']
  },
  {
    name: 'Kasaï-Central',
    code: 'KC',
    capital: 'Kananga',
    secondCity: 'Luiza',
    otherTowns: ['Kazumba', 'Dimbelenge', 'Dibaya'],
    educationProvinces: ['Kasaï-Central 1 (Kananga)', 'Kasaï-Central 2']
  },
  {
    name: 'Kasaï-Oriental',
    code: 'KO',
    capital: 'Mbuji-Mayi',
    secondCity: 'Tshilenge',
    otherTowns: ['Miabi', 'Kabeya-Kamwanga', 'Katanda', 'Lupatapata'],
    educationProvinces: ['Kasaï-Oriental 1 (Mbuji-Mayi)', 'Kasaï-Oriental 2']
  },
  {
    name: 'Kasaï',
    code: 'KAS',
    capital: 'Tshikapa',
    secondCity: 'Ilebo',
    otherTowns: ['Luebo', 'Mweka', 'Dekese'],
    educationProvinces: ['Kasaï 1 (Tshikapa)', 'Kasaï 2 (Ilebo)']
  },
  {
    name: 'Sankuru',
    code: 'SAN',
    capital: 'Lusambo',
    secondCity: 'Lodja',
    otherTowns: ['Tshumbe', 'Katako-Kombe', 'Kole', 'Lomela'],
    educationProvinces: ['Sankuru 1', 'Sankuru 2 (Lodja)']
  },
  {
    name: 'Lomami',
    code: 'LOM',
    capital: 'Kabinda',
    secondCity: 'Mwene-Ditu',
    otherTowns: ['Ngandajika', 'Kamiji', 'Lubao'],
    educationProvinces: ['Lomami 1 (Kabinda)', 'Lomami 2 (Mwene-Ditu)']
  },
  {
    name: 'Kongo-Central',
    code: 'KOC',
    capital: 'Matadi',
    secondCity: 'Boma',
    otherTowns: ['Muanda', 'Mbanza-Ngungu', 'Inkisi-Kisantu', 'Kasangulu', 'Lukula'],
    educationProvinces: ['Kongo-Central 1 (Matadi)', 'Kongo-Central 2 (Boma)', 'Kongo-Central 3']
  },
  {
    name: 'Kwango',
    code: 'KWA',
    capital: 'Kenge',
    secondCity: 'Kasongo-Lunda',
    otherTowns: ['Popokabaka', 'Feshi', 'Kahemba'],
    educationProvinces: ['Kwango 1 (Kenge)', 'Kwango 2']
  },
  {
    name: 'Kwilu',
    code: 'KWI',
    capital: 'Bandundu-ville',
    secondCity: 'Kikwit',
    otherTowns: ['Bulungu', 'Idiofa', 'Gungu', 'Masi-Manimba', 'Bagata'],
    educationProvinces: ['Kwilu 1 (Bandundu)', 'Kwilu 2 (Kikwit)', 'Kwilu 3']
  },
  {
    name: 'Mai-Ndombe',
    code: 'MN',
    capital: 'Inongo',
    secondCity: 'Nioki',
    otherTowns: ['Kutu', 'Mushie', 'Bolobo', 'Oshwe', 'Kiri'],
    educationProvinces: ['Mai-Ndombe 1 (Inongo)', 'Mai-Ndombe 2']
  }
];
