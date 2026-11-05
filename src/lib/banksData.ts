import { CountryInfo } from '../types';

export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    banks: ['Barclays Bank UK', 'HSBC UK', 'Lloyds Bank', 'NatWest', 'Standard Chartered UK', 'Santander UK', 'Metro Bank', 'Clydesdale Bank']
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    banks: ['JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Goldman Sachs', 'Morgan Stanley', 'U.S. Bank', 'PNC Bank', 'Truist']
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    banks: ['Deutsche Bank', 'Commerzbank', 'DZ Bank', 'KfW Bankengruppe', 'Bayerische Landesbank', 'Landesbank Baden-Württemberg']
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    banks: ['BNP Paribas', 'Crédit Agricole', 'Société Générale', 'Groupe BPCE', 'Crédit Mutuel', 'La Banque Postale']
  },
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    currency: 'CHF',
    banks: ['UBS Switzerland', 'Credit Suisse Group', 'Julius Baer', 'Swissquote Bank', 'Banque Cantonale de Genève', 'Raiffeisen Switzerland']
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    banks: ['First Abu Dhabi Bank (FAB)', 'Emirates NBD', 'Abu Dhabi Commercial Bank (ADCB)', 'Dubai Islamic Bank', 'Mashreq Bank', 'RAKBANK']
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    banks: ['Royal Bank of Canada (RBC)', 'TD Bank', 'Scotiabank', 'Bank of Montreal (BMO)', 'CIBC', 'National Bank of Canada']
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    banks: ['DBS Bank', 'OCBC Bank', 'United Overseas Bank (UOB)', 'Standard Chartered Singapore', 'Citibank Singapore']
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    currency: 'SAR',
    banks: ['Al Rajhi Bank', 'Saudi National Bank (SNB)', 'Riyad Bank', 'Banque Saudi Fransi', 'Alinma Bank', 'Arab National Bank']
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    currency: 'JPY',
    banks: ['Mitsubishi UFJ Financial Group (MUFG)', 'Sumitomo Mitsui Banking Corp (SMBC)', 'Mizuho Bank', 'Japan Post Bank', 'Resona Bank']
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    banks: ['Commonwealth Bank of Australia (CBA)', 'Westpac Banking Corp', 'Australia and New Zealand Banking (ANZ)', 'National Australia Bank (NAB)', 'Macquarie Bank']
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    banks: ['Standard Bank South Africa', 'FirstRand (FNB)', 'Absa Bank', 'Nedbank Group', 'Capitec Bank', 'Investec']
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    banks: ['Zenith Bank', 'Access Bank', 'Guaranty Trust Bank (GTBank)', 'First Bank of Nigeria', 'United Bank for Africa (UBA)', 'Fidelity Bank', 'Stanbic IBTC']
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    currency: 'KES',
    banks: ['KCB Bank Kenya', 'Equity Bank Kenya', 'Co-operative Bank of Kenya', 'NCBA Bank', 'Standard Chartered Kenya', 'Absa Bank Kenya']
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    currency: 'GHS',
    banks: ['GCB Bank', 'Ecobank Ghana', 'Standard Chartered Ghana', 'Stanbic Bank Ghana', 'Absa Bank Ghana', 'Zenith Bank Ghana']
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    currency: 'BRL',
    banks: ['Itaú Unibanco', 'Banco Bradesco', 'Banco do Brasil', 'Caixa Econômica Federal', 'Banco Santander Brasil', 'BTG Pactual']
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    banks: ['State Bank of India (SBI)', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank']
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    currency: 'CNY',
    banks: ['Industrial and Commercial Bank of China (ICBC)', 'China Construction Bank (CCB)', 'Agricultural Bank of China (ABC)', 'Bank of China (BOC)', 'Bank of Communications']
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    currency: 'EUR',
    banks: ['Banco Santander', 'BBVA', 'CaixaBank', 'Banco Sabadell', 'Bankinter', 'Abanca']
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    currency: 'EUR',
    banks: ['Intesa Sanpaolo', 'UniCredit', 'Cassa Depositi e Prestiti', 'Banco BPM', 'Banca Monte dei Paschi di Siena', 'BPER Banca']
  },
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    currency: 'EUR',
    banks: ['ING Bank', 'Rabobank', 'ABN AMRO', 'de Volksbank', 'Triodos Bank']
  },
  {
    code: 'SE',
    name: 'Sweden',
    flag: '🇸🇪',
    currency: 'SEK',
    banks: ['SEB (Skandinaviska Enskilda Banken)', 'Swedbank', 'Handelsbanken', 'Nordea Bank']
  },
  {
    code: 'NO',
    name: 'Norway',
    flag: '🇳🇴',
    currency: 'NOK',
    banks: ['DNB Bank', 'SpareBank 1', 'Storebrand Bank', 'Santander Consumer Bank Norway']
  },
  {
    code: 'IE',
    name: 'Ireland',
    flag: '🇮🇪',
    currency: 'EUR',
    banks: ['Bank of Ireland', 'Allied Irish Banks (AIB)', 'Permanent TSB', 'Barclays Bank Ireland']
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    currency: 'NZD',
    banks: ['ANZ New Zealand', 'ASB Bank', 'Bank of New Zealand (BNZ)', 'Westpac New Zealand', 'Kiwibank']
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    currency: 'MXN',
    banks: ['BBVA México', 'Santander México', 'Banorte', 'Citibanamex', 'HSBC México', 'Scotiabank México']
  },
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    currency: 'EGP',
    banks: ['National Bank of Egypt (NBE)', 'Banque Misr', 'Commercial International Bank (CIB)', 'QNB Alahli', 'Banque du Caire']
  },
  {
    code: 'QA',
    name: 'Qatar',
    flag: '🇶🇦',
    currency: 'QAR',
    banks: ['Qatar National Bank (QNB)', 'Qatar Islamic Bank (QIB)', 'Commercial Bank of Qatar', 'Masraf Al Rayan', 'Doha Bank']
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    currency: 'TRY',
    banks: ['Ziraat Bankası', 'Türkiye İş Bankası', 'Garanti BBVA', 'Akbank', 'Yapı Kredi', 'VakıfBank']
  },
  {
    code: 'HK',
    name: 'Hong Kong',
    flag: '🇭🇰',
    currency: 'HKD',
    banks: ['HSBC Hong Kong', 'Bank of China (Hong Kong)', 'Standard Chartered Hong Kong', 'Hang Seng Bank', 'BEA (Bank of East Asia)']
  },
  {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    currency: 'KRW',
    banks: ['KB Kookmin Bank', 'Shinhan Bank', 'Hana Bank', 'Woori Bank', 'Industrial Bank of Korea']
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    currency: 'MYR',
    banks: ['Maybank', 'CIMB Bank', 'Public Bank Berhad', 'RHB Bank', 'Hong Leong Bank', 'AmBank']
  }
];
