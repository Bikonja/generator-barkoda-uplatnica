/**
 * BarcodeGenerator - 2D Barcode generator for Croatian payment(LGPLv3)
 * version: 0.502
 */
BarcodePayment = new function() {
	var _me = this;
	
	// Constants
	var _allowedSingleByteCharacters = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", " ", ",", ".", ":", "-", "+", "?", "'", "/", "(", ")" ];
	var _allowedTwoByteCharacters = [ "Š", "Đ", "Č", "Ć", "Ž", "š", "đ", "č", "ć", "ž" ];
	var _allowedCharacters = jQuery.merge(jQuery.merge([], _allowedSingleByteCharacters), _allowedTwoByteCharacters);
	
	var _priceFieldLength = 15;
	var _pricePattern = "^[0-9]+,[0-9]{2}$";
	
	var _delimiter = String.fromCharCode(0x0A);
	var _header = "HRVHUB30";
	var _currency = "HRK"
	var _paymentModelPrefix = "HR";
	
	// Private variables
	var _settings;
	
	this.Defaults = {
		ValidateIBAN: false, // TODO: Implement IBAN validation
		ValidateModelPozivNaBroj: false // TODO: Implement callout number validation
	}
	
	// Public functions
	this.GetLength = function(str) {
		var len = 0;
		
		if (!StringNotDefinedOrEmpty(str)) {
			for (var i = 0; i < str.length; ++i) {
				var c = str[i];
				
				if (jQuery.inArray(c, _allowedTwoByteCharacters) > -1) {
					len += 2;
				} else if (jQuery.inArray(c, _allowedSingleByteCharacters) > -1) {
					len += 1;
				} else {
					return -1;
				}
			}
		}
		
		return len;
	}
	
	this.IsIBANValid = function(iban) {
		// TODO: Implement IBAN validation
		return true;
	}
	
	this.IsPaymentModelValid = function(paymentModel) {
		var isValid = false;
		
		$.each(BarcodePayment.PaymentModels, function() { 
			if (this.model == paymentModel) {
				isValid = true;
				return false; // Break out of each
			}
		});
		
		return isValid;
	}
	
	this.IsCalloutNumberValid = function(calloutNumber, paymentModel) {
		var isValid = true;
		
		if (isValid && _settings.ValidateModelPozivNaBroj) {
			// TODO: Implement callout number validation by model
		}
		
		return isValid;
	}
	
	this.IsIntentCodeValid = function(intentCode) {
		var isValid = false;
		
		$.each(BarcodePayment.IntentCodes, function() { 
			if (this.code == intentCode) {
				isValid = true;
				return false; // Break out of each
			}
		});
		
		return isValid;
	}
	
	this.ValidatePaymentParams = function(paymentParams) {
		if (!(paymentParams instanceof(BarcodePayment.PaymentParams))) {
			return null;
		}
		
		var result = BarcodePayment.ValidationResult.OK;
		var fieldLength = -1;

		// Price
		fieldLength = _me.GetLength(paymentParams.Iznos);
		if (fieldLength > BarcodePayment.MaxLengths.Price) {
			result |= BarcodePayment.ValidationResult.PriceMaxLengthExceeded;
		}
	
		if (!StringNotDefinedOrEmpty(paymentParams.Iznos) && (fieldLength == -1 || paymentParams.Iznos.match(_pricePattern) == null)) {
			result |= BarcodePayment.ValidationResult.PricePatternInvalid;
		}
		
		// Payer name
		fieldLength = _me.GetLength(paymentParams.ImePlatitelja);
		if (fieldLength > BarcodePayment.MaxLengths.PayerName) {
			result |= BarcodePayment.ValidationResult.PayerNameMaxLengthExceeded;
		}
		
		if (!StringNotDefinedOrEmpty(paymentParams.ImePlatitelja) && fieldLength == -1) {
			result |= BarcodePayment.ValidationResult.PayerNameInvalid;
		}
		
		// Payer address
		fieldLength = _me.GetLength(paymentParams.AdresaPlatitelja);
		if (fieldLength > BarcodePayment.MaxLengths.PayerAddress) {
			result |= BarcodePayment.ValidationResult.PayerAddressMaxLengthExceeded;
		}
		
		if (!StringNotDefinedOrEmpty(paymentParams.AdresaPlatitelja) && fieldLength == -1) {
			result |= BarcodePayment.ValidationResult.PayerAddressInvalid;
		}
		
		// Payer HQ
		fieldLength = _me.GetLength(paymentParams.SjedistePlatitelja);
		if (fieldLength > BarcodePayment.MaxLengths.PayerHQ) {
			result |= BarcodePayment.ValidationResult.PayerHQMaxLengthExceeded;
		}
		
		if (!StringNotDefinedOrEmpty(paymentParams.SjedistePlatitelja) && fieldLength == -1) {
			result |= BarcodePayment.ValidationResult.PayerHQInvalid;
		}
		
		// Receiver name
		fieldLength = _me.GetLength(paymentParams.Primatelj);
		if (fieldLength > BarcodePayment.MaxLengths.ReceiverName) {
			result |= BarcodePayment.ValidationResult.ReceiverNameMaxLengthExceeded;
		}
		
		if (!StringNotDefinedOrEmpty(paymentParams.Primatelj) && fieldLength == -1) {
			result |= BarcodePayment.ValidationResult.ReceiverNameInvalid;
		}
		
		// Receiver address
		fieldLength = _me.GetLength(paymentParams.AdresaPrimatelja);
		if (fieldLength > BarcodePayment.MaxLengths.ReceiverAddress) {
			result |= BarcodePayment.ValidationResult.ReceiverAddressMaxLengthExceeded;
		}
		
		if (!StringNotDefinedOrEmpty(paymentParams.AdresaPrimatelja) && fieldLength == -1) {
			result |= BarcodePayment.ValidationResult.ReceiverAddressInvalid;
		}
		
		// Receiver HQ
		fieldLength = _me.GetLength(paymentParams.SjedistePrimatelja);
		if (fieldLength > BarcodePayment.MaxLengths.ReceiverHQ) {
			result |= BarcodePayment.ValidationResult.ReceiverHQMaxLengthExceeded;
		}
		
		if (!StringNotDefinedOrEmpty(paymentParams.SjedistePrimatelja) && fieldLength == -1) {
			result |= BarcodePayment.ValidationResult.ReceiverHQInvalid;
		}
		
		// IBAN
		fieldLength = _me.GetLength(paymentParams.IBAN);
		if (fieldLength > BarcodePayment.MaxLengths.IBAN) {
			result |= BarcodePayment.ValidationResult.IBANMaxLengthExceeded;
		}
	
		if (!StringNotDefinedOrEmpty(paymentParams.IBAN) && fieldLength == -1) {
			result |= BarcodePayment.ValidationResult.IBANInvalid;
		}
		
		if (_settings.ValidateIBAN && !StringNotDefinedOrEmpty(paymentParams.IBAN) && !_me.IsIBANValid(paymentParams.IBAN)) {
			result |= BarcodePayment.ValidationResult.IBANInvalid;
		}
		
		// Payment model
		fieldLength = _me.GetLength(paymentParams.ModelPlacanja);
		if (fieldLength > BarcodePayment.MaxLengths.PaymentModel) {
			result |= BarcodePayment.ValidationResult.PaymentModelMaxLengthExceeded;
		}
	
		if (!StringNotDefinedOrEmpty(paymentParams.ModelPlacanja) && fieldLength == -1) {
			result |= BarcodePayment.ValidationResult.PaymentModelInvalid;
		}
		
		if (!StringNotDefinedOrEmpty(paymentParams.ModelPlacanja) && !_me.IsPaymentModelValid(paymentParams.ModelPlacanja)) {
			result |= BarcodePayment.ValidationResult.PaymentModelInvalid;
		}
		
		// Callout number
		fieldLength = _me.GetLength(paymentParams.PozivNaBroj);
		if (fieldLength > BarcodePayment.MaxLengths.CalloutNumber) {
			result |= BarcodePayment.ValidationResult.CalloutNumberMaxLengthExceeded;
		}
	
		if (!StringNotDefinedOrEmpty(paymentParams.PozivNaBroj) && fieldLength == -1) {
			result |= BarcodePayment.ValidationResult.CalloutNumberInvalid;
		}
		
		if (!StringNotDefinedOrEmpty(paymentParams.PozivNaBroj) && !_me.IsCalloutNumberValid(paymentParams.PozivNaBroj, paymentParams.ModelPlacanja)) {
			result |= BarcodePayment.ValidationResult.CalloutNumberInvalid;
		}
		
		// Intent code
		fieldLength = _me.GetLength(paymentParams.SifraNamjene);
		if (fieldLength > BarcodePayment.MaxLengths.IntentCode) {
			result |= BarcodePayment.ValidationResult.IntentCodeMaxLengthExceeded;
		}
	
		if (!StringNotDefinedOrEmpty(paymentParams.SifraNamjene) && fieldLength == -1) {
			result |= BarcodePayment.ValidationResult.IntentCodeInvalid;
		}
		
		if (!StringNotDefinedOrEmpty(paymentParams.SifraNamjene) && !_me.IsIntentCodeValid(paymentParams.SifraNamjene)) {
			result |= BarcodePayment.ValidationResult.IntentCodeInvalid;
		}
		
		// Description
		fieldLength = _me.GetLength(paymentParams.OpisPlacanja);
		if (fieldLength > BarcodePayment.MaxLengths.Description) {
			result |= BarcodePayment.ValidationResult.DescriptionMaxLengthExceeded;
		}
	
		if (!StringNotDefinedOrEmpty(paymentParams.OpisPlacanja) && fieldLength == -1) {
			result |= BarcodePayment.ValidationResult.DescriptionInvalid;
		}
		
		return result;
	}
	
	this.GetEncodedText = function(paymentParams) {
		if (!(paymentParams instanceof(BarcodePayment.PaymentParams))) {
			return BarcodePayment.ResultCode.InvalidObject;
		}
		
		if (BarcodePayment.ValidatePaymentParams(paymentParams) != BarcodePayment.ValidationResult.OK) {
			return BarcodePayment.ResultCode.InvalidContent;
		}

		return ConcatenateStrings(
			_header, _delimiter,
			_currency, _delimiter,
			EncodePrice(paymentParams.Iznos), _delimiter,
			paymentParams.ImePlatitelja, _delimiter,
			paymentParams.AdresaPlatitelja, _delimiter,
			paymentParams.SjedistePlatitelja, _delimiter,
			paymentParams.Primatelj, _delimiter,
			paymentParams.AdresaPrimatelja, _delimiter,
			paymentParams.SjedistePrimatelja, _delimiter,
			paymentParams.IBAN, _delimiter,
			_paymentModelPrefix, paymentParams.ModelPlacanja, _delimiter,
			paymentParams.PozivNaBroj, _delimiter,
			paymentParams.SifraNamjene, _delimiter,
			paymentParams.OpisPlacanja, _delimiter
		);
	}
	
	// Private functions
	var PadLeft = function(str, len, pad) {
		while (str.length < len) {
			str = pad + str;
		}

		return str;
	}
	
	var StringNotDefinedOrEmpty = function(str) {
		return str == undefined || str == null || str.length == 0;
	}
	
	var EncodePrice = function(price) {
		var fullLength = 15;
		return PadLeft(price.replace(',', ''), fullLength, '0');
	}
	
	var ConcatenateStrings = function() {
		var res = '';
		
		for (var i = 0; i < arguments.length; ++i) {
			if (typeof(arguments[i]) != 'undefined') {
				res += arguments[i];
			}
		}
		
		return res;
	}
	
	// Enumerations and helper classes
	// Source: PBZ net banking website
	this.IntentCodes = [
		{ code: "ADMG", title: "Administracija" },
		{ code: "GVEA", title: "Austrijski državni zaposlenici, Kategorija A" },
		{ code: "GVEB", title: "Austrijski državni zaposlenici, Kategorija B" },
		{ code: "GVEC", title: "Austrijski državni zaposlenici, Kategorija C" },
		{ code: "GVED", title: "Austrijski državni zaposlenici, Kategorija D" },
		{ code: "BUSB", title: "Autobusni" },
		{ code: "CPYR", title: "Autorsko pravo" },
		{ code: "HSPC", title: "Bolnička njega" },
		{ code: "RDTX", title: "Cestarina" },
		{ code: "DEPT", title: "Depozit" },
		{ code: "DERI", title: "Derivati (izvedenice)" },
		{ code: "FREX", title: "Devizno tržište" },
		{ code: "CGDD", title: "Direktno terećenje nastalo kao rezultat kartične transakcije" },
		{ code: "DIVD", title: "Dividenda" },
		{ code: "BECH", title: "Dječji doplatak" },
		{ code: "CHAR", title: "Dobrotvorno plaćanje" },
		{ code: "ETUP", title: "Doplata e-novca" },
		{ code: "MTUP", title: "Doplata mobilnog uređaja (bon)" },
		{ code: "GOVI", title: "Državno osiguranje" },
		{ code: "ENRG", title: "Energenti" },
		{ code: "CDCD", title: "Gotovinska isplata" },
		{ code: "CSDB", title: "Gotovinska isplata" },
		{ code: "TCSC", title: "Gradske naknade" },
		{ code: "CDCS", title: "Isplata gotovine s naknadom" },
		{ code: "FAND", title: "Isplata naknade za elementarne nepogode" },
		{ code: "CSLP", title: "Isplata socijalnih zajmova društava  banci" },
		{ code: "RHBS", title: "Isplata za vrijeme profesionalne rehabilitacije" },
		{ code: "GWLT", title: "Isplata žrtvama rata i invalidima" },
		{ code: "ADCS", title: "Isplate za donacije, sponzorstva, savjetodavne, intelektualne i druge usluge" },
		{ code: "PADD", title: "Izravno terećenje" },
		{ code: "INTE", title: "Kamata" },
		{ code: "CDDP", title: "Kartično plaćanje s odgodom" },
		{ code: "CDCB", title: "Kartično plaćanje uz gotovinski povrat (Cashback)" },
		{ code: "BOCE", title: "Knjiženje konverzije u Back Office-u" },
		{ code: "POPE", title: "Knjiženje mjesta kupnje" },
		{ code: "RCKE", title: "Knjiženje ponovne prezentacije čeka" },
		{ code: "AREN", title: "Knjiženje računa potraživanja" },
		{ code: "COMC", title: "Komercijalno plaćanje" },
		{ code: "UBIL", title: "Komunalne usluge" },
		{ code: "COMT", title: "Konsolidirano plaćanje treće strane za račun potrošača." },
		{ code: "SEPI", title: "Kupnja vrijednosnica (interna)" },
		{ code: "GDDS", title: "Kupovina-prodaja roba" },
		{ code: "GSCB", title: "Kupovina-prodaja roba i usluga uz gotovinski povrat" },
		{ code: "GDSV", title: "Kupovina/prodaja roba i usluga" },
		{ code: "SCVE", title: "Kupovina/prodaja usluga" },
		{ code: "HLTC", title: "Kućna njega bolesnika" },
		{ code: "CBLK", title: "Masovni kliring kartica" },
		{ code: "MDCS", title: "Medicinske usluge" },
		{ code: "NWCM", title: "Mrežna komunikacija" },
		{ code: "RENT", title: "Najam" },
		{ code: "ALLW", title: "Naknada" },
		{ code: "SSBE", title: "Naknada socijalnog osiguranja" },
		{ code: "LICF", title: "Naknada za licencu" },
		{ code: "GFRP", title: "Naknada za nezaposlene u toku stečaja" },
		{ code: "BENE", title: "Naknada za nezaposlenost/invaliditet" },
		{ code: "CFEE", title: "Naknada za poništenje" },
		{ code: "AEMP", title: "Naknada za zapošljavanje" },
		{ code: "COLL", title: "Naplata" },
		{ code: "FCOL", title: "Naplata naknade po kartičnoj transakciji" },
		{ code: "DBTC", title: "Naplata putem terećenja" },
		{ code: "NOWS", title: "Nenavedeno" },
		{ code: "IDCP", title: "Neopozivo plaćanje sa računa debitne kartice" },
		{ code: "ICCP", title: "Neopozivo plaćanje sa računa kreditne kartice" },
		{ code: "BONU", title: "Novčana nagrada (bonus)." },
		{ code: "PAYR", title: "Obračun plaća" },
		{ code: "BLDM", title: "Održavanje zgrada" },
		{ code: "HEDG", title: "Omeđivanje rizika (Hedging)" },
		{ code: "CDOC", title: "Originalno odobrenje" },
		{ code: "PPTI", title: "Osiguranje imovine" },
		{ code: "LBRI", title: "Osiguranje iz rada" },
		{ code: "OTHR", title: "Ostalo" },
		{ code: "CLPR", title: "Otplata glavnice kredita za automobil" },
		{ code: "HLRP", title: "Otplata stambenog kredita" },
		{ code: "LOAR", title: "Otplata zajma" },
		{ code: "ALMY", title: "Plaćanje alimentacije" },
		{ code: "RCPT", title: "Plaćanje blagajničke potvrde. (ReceiptPayment)" },
		{ code: "PRCP", title: "Plaćanje cijene" },
		{ code: "SUPP", title: "Plaćanje dobavljača" },
		{ code: "CFDI", title: "Plaćanje dospjele glavnice" },
		{ code: "GOVT", title: "Plaćanje države" },
		{ code: "PENS", title: "Plaćanje mirovine" },
		{ code: "DCRD", title: "Plaćanje na račun debitne kartice." },
		{ code: "CCRD", title: "Plaćanje na račun kreditne kartice" },
		{ code: "SALA", title: "Plaćanje plaće" },
		{ code: "REBT", title: "Plaćanje popusta/rabata" },
		{ code: "TAXS", title: "Plaćanje poreza" },
		{ code: "VATX", title: "Plaćanje poreza na dodatnu vrijednost" },
		{ code: "RINP", title: "Plaćanje rata koje se ponavljaju" },
		{ code: "IHRP", title: "Plaćanje rate pri kupnji na otplatu" },
		{ code: "IVPT", title: "Plaćanje računa" },
		{ code: "CDBL", title: "Plaćanje računa za kreditnu karticu" },
		{ code: "TREA", title: "Plaćanje riznice" },
		{ code: "CMDT", title: "Plaćanje roba" },
		{ code: "INTC", title: "Plaćanje unutar društva" },
		{ code: "INVS", title: "Plaćanje za fondove i vrijednosnice" },
		{ code: "PRME", title: "Plemeniti metali" },
		{ code: "AGRT", title: "Poljoprivredni transfer" },
		{ code: "INTX", title: "Porez na dohodak" },
		{ code: "PTXP", title: "Porez na imovinu" },
		{ code: "NITX", title: "Porez na neto dohodak" },
		{ code: "ESTX", title: "Porez na ostavštinu" },
		{ code: "GSTX", title: "Porez na robu i usluge" },
		{ code: "HSTX", title: "Porez na stambeni prostor" },
		{ code: "FWLV", title: "Porez na strane radnike" },
		{ code: "WHLD", title: "Porez po odbitku" },
		{ code: "BEXP", title: "Poslovni troškovi" },
		{ code: "REFU", title: "Povrat" },
		{ code: "TAXR", title: "Povrat poreza" },
		{ code: "RIMB", title: "Povrat prethodne pogrešne transakcije" },
		{ code: "OFEE", title: "Početna naknada (Opening Fee)" },
		{ code: "ADVA", title: "Predujam" },
		{ code: "INSU", title: "Premija osiguranja" },
		{ code: "INPC", title: "Premija osiguranja za vozilo" },
		{ code: "TRPT", title: "Prepaid cestarina (ENC)" },
		{ code: "SUBS", title: "Pretplata" },
		{ code: "CASH", title: "Prijenos gotovine" },
		{ code: "PENO", title: "Prisilna naplata" },
		{ code: "COMM", title: "Provizija" },
		{ code: "INSM", title: "Rata" },
		{ code: "ELEC", title: "Račun za električnu energiju" },
		{ code: "CBTV", title: "Račun za kabelsku TV" },
		{ code: "OTLC", title: "Račun za ostale telekom usluge" },
		{ code: "GASB", title: "Račun za plin" },
		{ code: "WTER", title: "Račun za vodu" },
		{ code: "ANNI", title: "Renta" },
		{ code: "BBSC", title: "Rodiljna naknada" },
		{ code: "NETT", title: "Saldiranje (netiranje)" },
		{ code: "CAFI", title: "Skrbničke naknade (interne)" },
		{ code: "STDY", title: "Studiranje" },
		{ code: "ROYA", title: "Tantijeme" },
		{ code: "PHON", title: "Telefonski račun" },
		{ code: "FERB", title: "Trajektni" },
		{ code: "DMEQ", title: "Trajna medicinska pomagala" },
		{ code: "WEBI", title: "Transakcija inicirana internetom" },
		{ code: "TELI", title: "Transakcija inicirana telefonom" },
		{ code: "HREC", title: "Transakcija se odnosi na doprinos poslodavca za troškove stanovanja" },
		{ code: "CBFR", title: "Transakcija se odnosi na kapitalnu štednju za mirovinu" },
		{ code: "CBFF", title: "Transakcija se odnosi na kapitalnu štednju, općenito" },
		{ code: "TRAD", title: "Trgovinske usluge" },
		{ code: "COST", title: "Troškovi" },
		{ code: "CPKC", title: "Troškovi parkiranja" },
		{ code: "TBIL", title: "Troškovi telekomunikacija" },
		{ code: "NWCH", title: "Troškovi za mrežu" },
		{ code: "EDUC", title: "Troškovi školovanja" },
		{ code: "LIMA", title: "Upravljanje likvidnošću" },
		{ code: "ACCT", title: "Upravljanje računom" },
		{ code: "ANTS", title: "Usluge anestezije" },
		{ code: "VIEW", title: "Usluge oftalmološke skrbi" },
		{ code: "LTCF", title: "Ustanova dugoročne zdravstvene skrbi" },
		{ code: "ICRF", title: "Ustanova socijalne skrbi" },
		{ code: "CVCF", title: "Ustanova za usluge skrbi za rekonvalescente" },
		{ code: "PTSP", title: "Uvjeti plaćanja" },
		{ code: "MSVC", title: "Višestruke vrste usluga" },
		{ code: "SECU", title: "Vrijednosni papiri" },
		{ code: "LOAN", title: "Zajam" },
		{ code: "FCPM", title: "Zakašnjele naknade" },
		{ code: "TRFD", title: "Zaklada" },
		{ code: "CDQC", title: "Zamjenska gotovina" },
		{ code: "HLTI", title: "Zdravstveno osiguranje" },
		{ code: "AIRB", title: "Zračni" },
		{ code: "DNTS", title: "Zubarske usluge" },
		{ code: "SAVG", title: "Štednja" },
		{ code: "RLWY", title: "Željeznički" },
		{ code: "LIFI", title: "Životno osiguranje" }
	]

	// TODO: Add validation rules for every payment model
	// Source: FINA website - http://www.fina.hr/fgs.axd?id=16090&usg=AFQjCNF8XEhnL9POBo5CccBjCWW9gzBJJg&sig2=b5VcZvu4wgv185jhJR-U_w&cad=rja
	this.PaymentModels = [
		{ model: "00" },
		{ model: "01" },
		{ model: "02" },
		{ model: "03" },
		{ model: "04" },
		{ model: "05" },
		{ model: "06" },
		{ model: "07" },
		{ model: "08" },
		{ model: "09" },
		{ model: "10" },
		{ model: "11" },
		{ model: "12" },
		{ model: "13" },
		{ model: "14" },
		{ model: "15" },
		{ model: "16" },
		{ model: "17" },
		{ model: "18" },
		{ model: "23" },
		{ model: "24" },
		{ model: "26" },
		{ model: "27" },
		{ model: "28" },
		{ model: "29" },
		{ model: "30" },
		{ model: "31" },
		{ model: "33" },
		{ model: "34" },
		{ model: "40" },
		{ model: "41" },
		{ model: "42" },
		{ model: "43" },
		{ model: "55" },
		{ model: "62" },
		{ model: "63" },
		{ model: "64" },
		{ model: "65" },
		{ model: "67" },
		{ model: "68" },
		{ model: "69" },
		{ model: "99" },
		{ model: "25" },
		{ model: "83" },
		{ model: "84" },
		{ model: "50" }
	]
	
	this.AllowedSingleByteCharacters = jQuery.merge([], _allowedSingleByteCharacters);
	this.AllowedTwoByteCharacters = jQuery.merge([], _allowedTwoByteCharacters);
	this.AllowedCharacters = jQuery.merge([], _allowedCharacters);
	this.PricePattern = _pricePattern.substr(0);
	
	this.MaxLengths = {
		Price: 16,
		PayerName: 30,
		PayerAddress: 27,
		PayerHQ: 27,
		ReceiverName: 25,
		ReceiverAddress: 25,
		ReceiverHQ: 27,
		IBAN: 21,
		PaymentModel: 2,
		CalloutNumber: 22,
		IntentCode: 4,
		Description: 35
	}
	
	this.ResultCode = {
		OK: 0,
		InvalidObject: 1,
		InvalidContent: 2
	}
	
	this.ValidationResult = {
		OK: 0,
		
		PricePatternInvalid: 1,
		PriceMaxLengthExceeded: 2,
		
		PayerNameInvalid: 4,
		PayerNameMaxLengthExceeded: 8,
		
		PayerAddressInvalid: 16,
		PayerAddressMaxLengthExceeded: 32,
		
		PayerHQInvalid: 64,
		PayerHQMaxLengthExceeded: 128,
		
		ReceiverNameInvalid: 256,
		ReceiverNameMaxLengthExceeded: 512,
		
		ReceiverAddressInvalid: 1024,
		ReceiverAddressMaxLengthExceeded: 2048,
		
		ReceiverHQInvalid: 4096,
		ReceiverHQMaxLengthExceeded: 8192,
		
		IBANInvalid: 16384,
		IBANMaxLengthExceeded: 32768,
		
		PaymentModelInvalid: 65536,
		PaymentModelMaxLengthExceeded: 131072,
		
		CalloutNumberInvalid: 262144,
		CalloutNumberMaxLengthExceeded: 524288,
		
		IntentCodeInvalid: 1048576,
		IntentCodeMaxLengthExceeded: 2097152,
		
		DescriptionInvalid: 4194304,
		DescriptionMaxLengthExceeded: 8388608
	}
	
	this.PaymentParams = function () {
		this.Iznos = "";
		this.ImePlatitelja = "";
		this.AdresaPlatitelja = "";
		this.SjedistePlatitelja = "";
		this.Primatelj = "";
		this.AdresaPrimatelja = "";
		this.SjedistePrimatelja = "";
		this.IBAN = "";
		this.ModelPlacanja = "";
		this.PozivNaBroj = "";
		this.SifraNamjene = "";
		this.OpisPlacanja = "";
	}
	
	// Initialization method
	this.Init = function(settings) {
		_settings = jQuery.extend({}, BarcodePayment.Defaults, settings);
	}
}