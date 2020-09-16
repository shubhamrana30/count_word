

var price=123
const data = document.getElementsByClassName("data")

var stripehandler = StripeCheckout.configure({
    key: stripepublickey,
    locale: 'en',
    token: function(token){
        console.log(data[0].value)
        console.log(token)
        console.log(token.card.id)
        const user_info = [data[0].value,data[1].value,data[2].value,data[3].value,data[4].value,data[5].value,data[6].value]
        console.log(user_info)
        fetch('/donatefinal',{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                token_id: token.id,
                user_info: user_info
            })
        })
        .then(res=>{
            return res.json()
        })
        .then(re=>{
            alert(re.message)
        })
        .catch(error=>{
            //console.error(error);
            alert('error while payment')
        })
    }
})


function donate_clicked(){
    stripehandler.open({
        amount: data[6].value
    })
}