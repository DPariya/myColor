const user = {
    name: "Ed",
    age : 25,
    photos : [1,2,3,4,5,6],
    analytics : {
        subscription : 2500,
        videos :  25
    }
}
const {photos,age, ...rest} = user;

(function hllo(){
    console.log(rest);
    const d = "dipti";
console.log(d);

})();