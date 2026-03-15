const AlphaNumregex = /^[a-z0-9]+$/i;
const AlphaNumQregex = /^[a-z0-9"']+$/i;


function sliceURL(url){
    const i = url.lastIndexOf('?');
    return [url.slice(0,i), url.slice(i+1).split('&')];
}

/*
function getEval(exec, safe){
    let toeval = [];
    if(exec != []){
        let danger = false;

        exec.forEach(line => function(){
            let cd = line.split('=');

            if(cd.length == 1){
                if(cd[0][0] == '!'){
                    cd[0] = cd[0].slice(1);
                    cd.push("false");
                }
                else{
                    cd.push("true");
                }
            }

            if(cd.length == 2 && AlphaNumQregex.test(cd[0]) && AlphaNumQregex.test(cd[1])){
                toeval.push(`${cd[0]} = ${cd[1]}`);
            }

            else{danger = true;}
        });


        if(danger && !safe){
            if(confirm(`Are you sure this link was safe?: Code to be executed\n${exec.replaceAll('&', ';')}`)){
                return exec;
            }
        }
    }

    return toeval;
}

getEval(exec, false).forEach(str => eval(str));

*/





const url = window.location.href;
const [base, exec] = sliceURL(url);




const urlVals = new Map();


exec.forEach(line => {
    let cd = line.split('=');

    if(cd.length == 1){
        if(cd[0][0] == '!'){
            cd[0] = cd[0].slice(1);
            cd.push("false");
        }
        else{
            cd.push("true");
        }
    }

    urlVals.set(cd[0], cd[1]);

});