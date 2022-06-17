"use strict";

//note, Hebrew ABC is hard to include through text-editors due to directional writing(Hebrew is RTL, code is LTR)
//instead, I'll use its Unicode, for JavaScript and RegExpt its pretty much the same.
//note, even I fix some sequences, due to multiple of fixes, in some cases sequences can be created due to removal of other sequences. it is fine.


//optional alternative to Math.random, instead of multiple calls to Math.random, just use the next index in the array below.
//,randomness = Array.from( crypto.getRandomValues(new Uint8Array(100)) )

//stuff I've used to get the Unicode value of the character.
//"אהוי".split("").map((c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4,"0").toUpperCase())
//"\\u" + "ץ".charCodeAt(0).toString(16).padStart(4,"0").toUpperCase()

//alphabet      "אבגדהוזחטיכלמנסעפצקרשת".split("")
//vowels_only   "אהוי".split("")


Array.prototype.shuffle = function(seed){
  return this.sort(function(a,b){return (0 === (~~(Math.random() * 10)) % 3) ? (-1) : 1;});
}

function natural_compare(a, b){
  var ax=[], bx=[];
  
  a.replace(/(\d+)|(\D+)/g, function(_, $1, $2){ ax.push([$1 || Infinity, $2 || ""]); });
  b.replace(/(\d+)|(\D+)/g, function(_, $1, $2){ bx.push([$1 || Infinity, $2 || ""]); });

  while(ax.length > 0 && bx.length > 0){
    var an, bn, nn;
    
    an = ax.shift();
    bn = bx.shift();
    nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
    if(nn) return nn;
  }
  return ax.length - bx.length;
}


var   alphabet_whole          = ["\u05D0","\u05D1","\u05D2","\u05D3","\u05D4","\u05D5","\u05D6","\u05D7"
                                ,"\u05D8","\u05D9","\u05DB","\u05DC","\u05DE","\u05E0","\u05E1","\u05E2"
                                ,"\u05E4","\u05E6","\u05E7","\u05E8","\u05E9","\u05EA"
                                ]
     ,vowels_only             = ["\u05D0"   //א
                                ,"\u05D4"   //ה
                                ,"\u05D5"   //ו
                                ,"\u05D9"   //י
                                ].shuffle()
     ,alphabet_without_vowels = alphabet_whole.filter((c) => {return (-1 === vowels_only.indexOf(c));})
                                              .shuffle()
     ,suffix_characters_map   = {"\u05E0" : "\u05DF"    //נ»ן
                                ,"\u05DE" : "\u05DD"    //מ»ם
                                ,"\u05E6" : "\u05E5"    //צ»ץ
                                ,"\u05E4" : "\u05E3"    //פ»ף
                                ,"\u05DB" : "\u05DA"    //כ»ך
                                }
     ,bank                    = [].concat( //a sufficient-length source of characters 
                                           //so it won't matter that some would be removed through various fixes below.
                                          alphabet_without_vowels
                                         ,alphabet_without_vowels
                                         ,alphabet_without_vowels
                                         ,vowels_only
                                         )
;


function get_hebrew_random_phrase(length){
  length = length || (4 + Math.random()*3);

var result = bank.shuffle();

//add one vowel after each character.
result = result.map((c,index) => {return c + vowels_only[index % vowels_only.length]});

/*
//add one vowel after most characters, in some cases add a non-vowel.
result = result.map((c,index) => {
                  return c + (
                              0 === (index % 10) ?  alphabet_without_vowels[index % alphabet_without_vowels.length]
                                                 :  vowels_only[index % vowels_only.length]
                             );
               })
               ;
*/

result = result.join("").split("");

//---------- remove sequence: any two repeating characters.
result = result.filter((c,index) => {return (result[index - 1] || "") !== c});

//---------- remove sequence: two vowels one after the other.
result = result.filter((c,index) => {
  var c_before = (result[index - 1] || "");

  if(-1 !== vowels_only.indexOf(c)){
    return (-1 === vowels_only.indexOf(c_before));  //only include this vowel-character if previous character wasn't a vowel.
  }else{
    return true; //no restrictions regarding non-vowel.
  }
});

/* adding this fix creates a lot of repeating vowels..

//---------- remove sequence: four non-vowels.
result = result.filter((c,index) => {
  var c_before               = (result[index - 1] || "");
  var c_before_before        = (result[index - 2] || "");
  var c_before_before_before = (result[index - 2] || "");

  if(-1 !== alphabet_without_vowels.indexOf(c)){
    //only include this non-vowel-character if both previous characters were not also a non-vowel.
    return (
             -1 === vowels_only.indexOf(c_before)
          && -1 === vowels_only.indexOf(c_before_before)
          && -1 === vowels_only.indexOf(c_before_before_before)
           );  
  }else{
    return true; //no restrictions regarding non-vowel.
  }
});
*/


//string manipulation based on regex that makes it easier to read the result
result = result.join("");

/*
//---------- remove some characters.
result = result
            .replace(/\u05E2/g,"") //remove ע "\u05E2"
            .replace(/\u05D6/g,"") //remove ז "\u05D6"
            ;
*/

//---------- fix similar to hear sequence.
result = result
             .replace(/(\u05D8|\u05EA)(\u05D8|\u05EA)/g,"\u05D8")  //טת/טת»ט
             .replace(/(\u05DB|\u05D7)(\u05DB|\u05D7)/g,"\u05D7")  //חכ/כח»ח
             .replace(/(\u05E2|\u05D0)(\u05E2|\u05D0)/g,"\u05E2")  //אע/עא»ע
             .replace(/(\u05E2|\u05D4)(\u05E2|\u05D4)/g,"\u05E2")  //הע/עה»ע
             .replace(/(\u05E9|\u05E1)(\u05E9|\u05E1)/g,"\u05E9")  //שס/סש»ש --- \u05E9 ש has a more audio-flexibility.
             .replace(/(\u05E6|\u05E9)(\u05E6|\u05E9)/g,"\u05E6")  //צש/שצ»צ --- \u05E6 צ is funnier
             .replace(/(\u05E6|\u05E1)(\u05E6|\u05E1)/g,"\u05E6")  //צס/סצ»צ --- \u05E6 צ is funnier
             .replace(/(\u05DB|\u05E7)(\u05DB|\u05E7)/g,"\u05E7")  //כק/קכ»ק --- \u05E7 ק is funnier (even though \u05DB כ has a more audio-flexibility, but since it can also sound like \u05D7 ח which I've already replaced, I've opt-to use the funnier variation).
             ;

/*
//---------- fix hard to speak sequence
צט
טצ
תצ
צת
סצ
סצ
*/

//---------- end of string rules.
//א and ה are hard to read if the last letter is also a vowel.
result = result.replace(/(\u05D0|\u05D4)(.)(\u05D0|\u05D4|\u05D5|\u05D9)$/,"$2$3");   //בבבבהבא»בבבבבא





//----------- since fixes to the end of the string has already provided, choose from the end of the string a sequence.
result = result.substr((-1) * length);


//---------- fixes that does not reduce the amount of characters (same length replacements).

//suffix-characters instead of normal characters
var last_character = result[result.length -1];
last_character = last_character.replace(last_character, suffix_characters_map[ last_character ] || last_character);
result = result.replace(/.$/,last_character);


result = result
           .replace(/^(\u05D5)/g,"\u05E8")    //\u05D5 ו at the start of the sentence to \u05E8 ר .
           ;

return result;
}

//just debug
console.log(
  get_hebrew_random_phrase()
);

//fill the document with some text.
//document.querySelector("body").innerText = phrases;


/*
//-----for NodeJS. basic html taken from https://eladkarako.github.io/bin/

var array_of_phrases = (new Array(1234567)).join(",").split(",")
                                      .map((c) => get_hebrew_random_phrase())
                                      ;                                      
//--------------------------------- unique.
var tmp = new Object(null);
array_of_phrases.forEach((phrase) => { tmp[phrase] = ""; });
array_of_phrases = Object.keys(tmp);
//---------------------------------------------------------

array_of_phrases = array_of_phrases.sort(natural_compare);   //natural sort.

var phrases = array_of_phrases.join("\r\n");

require("fs").writeFileSync("1.txt",phrases,{"encoding":"utf8","flag":"w"});
*/

