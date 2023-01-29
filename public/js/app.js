const contactForm = document.querySelector('.contact-form');
//pobiera elementy poprzez ID
let namee = document.getElementById('name');        //dane sa pobierane przez ID
let email = document.getElementById('email');
let subject = document.getElementById('subject');
let message = document.getElementById('message');

contactForm.addEventListener("submit", (e)=>{
    e.preventDefault();

    let formData ={                                 //dane sa przekazywane jako obiekt do zmiennej formData
        name: namee.value,
        email: email.value,
        subject: subject.value,
        message: message.value
    }
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/form');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.onload =  function(){
        console.log(xhr.responseText);
            if(xhr.responseText == 'success'){
                alert('An E-mail has been sent');
                namee.value = '',
                email.value = '',
                subject.value = '',
                message.value = ''
            }else{
                alert('Somethng is no yes!');
            }
    }
    xhr.send(JSON.stringify(formData));
});