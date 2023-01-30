const registerForm = document.querySelector('.register-form');

const username = document.querySelector('#username');
const pass = document.querySelector('#pasword');
const pass2 = document.querySelector('#pasword2');
const email = document.querySelector('#email');
const sendBtn = document.querySelector('.send');
const clearBtn = document.querySelector('.clear');
const popup = document.querySelector('.popup');

//////////////////////////

registerForm.addEventListener("send", (e)=>{
    e.preventDefault();
    let formData ={                                 //dane sa przekazywane jako obiekt do zmiennej formData
        nameReg: username.value,
        emailReg: email.value,
        passReg: pass.value
    }
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/register');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.onload =  function(){
        console.log(xhr.responseText);
            
    }
    xhr.send(JSON.stringify(formData));
});

/////////////////////////
const showError = (input, msg) => {
    const formBox = input.parentElement;
    const errorMsg = formBox.querySelector('.error-text');
    formBox.classList.add('error');
    errorMsg.textContent = msg;
};

const clearError = (input) => {
    const formBox = input.parentElement;
    formBox.classList.remove('error');
};

const checkForm = (input) => {
    input.forEach(el => {
        if(el.value === ''){
            showError(el, el.placeholder)
        } else {
            clearError(el)
        }
    });
};

const checkLength = (input, min) =>{
    if(input.value.length < min){
        showError(input, `The ${input.previousElementSibling.innerText.slice(0,-1)} consists of at least ${min} characters!!!`)
    }
};

const checkPassword = (pass1, pass2) => {
    if(pass1.value !== pass2.value){
        showError(pass2, 'The passwords should be the same!!!')
    }
};

const checkMail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(re.test(email.value)){
        clearError(email)
    }else {
        showError(email, 'Incorrect email address!!!')
    }
};

const checErrors = () => {
    const allInputs = document.querySelectorAll('.form-box');
    let errorCount = 0;

    allInputs.forEach(el => {
        if(el.classList.contains('error')){
            errorCount++;
        }
    })
    if(errorCount === 0){
        popup.classList.add('show-popup');
    }
};

sendBtn.addEventListener('click', (event) => {
    event.preventDefault();
    checkForm([username, pass, pass2, email]);
    checkLength(username, 3);
    checkLength(pass, 8);
    checkPassword(pass, pass2);
    checkMail(email);
    checErrors();
});

clearBtn.addEventListener('click', (event) => {
    event.preventDefault();
    [username, pass, pass2, email].forEach(el=>{
        el.value = '';
        clearError(el);
    });
});

console.log(username);