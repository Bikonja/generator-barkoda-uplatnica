# Generator barkoda za uplatnice
Jednostavno generiranje 2D barkoda za uplatnice napravljeno u Javascriptu.

Vrlo jednostavno omogućite svojim klijentima printanje ili skeniranje 2D barkoda kako bi lakše napravili uplatu na vaš račun!

Ovaj projekt se sastoji od library-a koji omogućuje jednostavno prikupljanje, provjeravanje i pretvaranje podataka u format spreman za prebacivanje u 2D barkod po [standardu definiranom od strane Hrvatske udruge banaka](http://www.hub.hr/sites/default/files/2dbc_0.pdf), te primjera korištenja njega u kombinaciji sa [drugim library-om](https://github.com/bkuzmic/pdf417-js) (PDF417-js, autor Boris Kuzmic) za generiranje samog 2D barkoda iz teksta u traženom formatu. Iz primjera se može vidjeti kako koristiti oba library-a, ali je jednostavno i vidjeti kako bi se koristio pojedinačni library ukoliko želite.

Sve je potpuno besplatno i slobodno se koristi u komercijalne svrhe jer je pod licencom LGPL.

# Stvari koje još nisu implementirane
* Validacija modela plaćanja (pri kraju)
* Validacija šifre namjene (pri kraju)
* Stranica za primjer korištenja (započeto)
* Validacija poziva na broj u odnosu na označeni model plaćanja
* Validacija IBAN-a