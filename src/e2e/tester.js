export const executeTest=(stepTitle,test)=>{
    try{
        test();
        console.log('SUCCES',stepTitle);
    }catch(err){
        console.error('FAIL',stepTitle)
    }
}