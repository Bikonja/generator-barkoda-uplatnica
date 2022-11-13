//HR: IBAN koristi MOD97 provjeru za checksum, ova provjera samo
//validira strukturu IBAN-a, a ne njegovo postojanje u sustavu.
//Za provjeru postojanja u sustavu potrebno je koristiti
//jedan od bankarskih API-a.

//EN: IBAN uses MOD97 checksum, this check only validates
//the structure of the IBAN, but not it's existence in the system.
//For checking it's existance use one of existing banking API's

//Source: https://www.alpha.gr/-/media/alphagr/files/files-archive/personalbanking/iban_check_digit_en.pdf
module.exports = function validateIBAN(inputIBAN) {

    const letterOneToNumber = letterTable[inputIBAN[0]];
    const letterTwoToNumber = letterTable[inputIBAN[1]];
    const letterThree = inputIBAN[2];
    const letterFour = inputIBAN[3];

    const restOfString = inputIBAN.slice(4);

    const stringToParse = restOfString.concat(letterOneToNumber, letterTwoToNumber, letterThree, letterFour);

    const ibanInteger = BigInt(stringToParse);
    
    if(ibanInteger % 97n != 1) return false;

    return true;
}

letterTable = {
    A : 10, G : 16, M : 22, S : 28, Y : 34,
    B : 11, H : 17, N : 23, T : 29, Z : 35,
    C : 12, I : 18, O : 24, U : 30,
    D : 13, J : 19, P : 25, V : 31,
    E : 14, K : 20, Q : 26, W : 32,
    F : 15, L : 21, R : 27, X : 33 
}