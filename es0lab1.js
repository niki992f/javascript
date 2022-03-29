"use strict"

const stringhe = ["spring", "it", "cat", "a"];

function resizeString(str) {
    let new_str;
    if(str.length < 2)
        new_str="";
    else
        new_str=str.substring(0,2) + str.substring(str.length-2, str.length);
    return new_str;
}

for(let i=0; i<stringhe.length; i++){
    let str = resizeString(stringhe[i]);
    console.log(str);
}