"""Approximate Persian reading hints. Dotless ı and front rounded ö/ü need actual Turkish audio.
This is not IPA and cannot certify stress, length, regional speech or native pronunciation.
"""
import re
LETTERS={'b':'ب','c':'ج','ç':'چ','d':'د','f':'ف','g':'گ','ğ':'','h':'ه','j':'ژ','k':'ک','l':'ل','m':'م','n':'ن','p':'پ','r':'ر','s':'س','ş':'ش','t':'ت','v':'و','y':'ی','z':'ز'}
VOWELS={'a':'َ','e':'ِ','ı':'ِ','i':'ی','o':'ُ','ö':'ُ','u':'و','ü':'و','â':'ا','î':'ی','û':'و'}
INITIAL={'a':'اَ','e':'اِ','ı':'اِ','i':'ای','o':'اُ','ö':'اُ','u':'او','ü':'او','â':'آ','î':'ای','û':'او'}
KNOWN={
'merhaba':'مِرحَبا','günaydın':'گون‌آیدِن','teşekkürler':'تِشِکّورلِر','teşekkür':'تِشِکّور','ederim':'اِدِریم',
'iyi':'ایی','iyiyim':'ایی‌ییم','görüşürüz':'گُروشوروز','adım':'آدِم','adın':'آدِن','ece':'اِجِه','sara':'سارا','mert':'مِرت','ali':'عَلی','ayşe':'آیشه','hanım':'هانِم',
'çay':'چای','su':'سو','süt':'سوت','hayır':'هایِر','evet':'اِوِت','ben':'بِن','sen':'سِن','bir':'بیر','iki':'ایکی','üç':'اوچ','dört':'دُرت','beş':'بِش','altı':'آلتِ','yedi':'یِدی','sekiz':'سِکیز','dokuz':'دُکوز','on':'اُن','yirmi':'ییرمی','otuz':'اُتوز','elli':'اِلّی','yüz':'یوز',
'kitap':'کیتاپ','kitabı':'کیتابِ','kitabım':'کیتابِم','lütfen':'لوتفِن','türkçe':'تورکچه','öğrenci':'اُورِنجی','öğretmen':'اُورِتمِن','değil':'دِییل','ankara':'آنکارا','izmir':'ایزمیر','yağmur':'یامور','soğuk':'سُوک',
}
def word(w):
    s=w.lower().replace('i̇','i')
    if s in KNOWN:return KNOWN[s]
    out=[]
    for i,c in enumerate(s):
        if c in VOWELS:
            out.append(INITIAL[c] if i==0 else 'ا' if c=='a' and i==len(s)-1 else 'ه' if c=='e' and i==len(s)-1 else VOWELS[c])
        else:out.append(LETTERS[c])
    return ''.join(out)
def pronounce(text):
    if text=='E–C–E.':return 'اِ ـ جِه ـ اِ؛ هجی نام اجه'
    if text=='I, ı; İ, i.':return 'آیِ بی‌نقطه؛ ایِ نقطه‌دار؛ صدا را با نمونهٔ صوتی مقایسه کن'
    s=re.sub(r'[A-Za-zÇçĞğİıÖöŞşÜüÂâÎîÛû]+',lambda m:word(m[0]),text)
    s=s.translate(str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹'))
    assert not re.search('[a-zçğıöşü]',s,re.I),s
    return s
