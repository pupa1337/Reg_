document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); 

    const username = event.target.username.value;
    const password = event.target.password.value;
    const errorMessage = document.getElementById("errorMessage");

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' 
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Неверные имя пользователя или пароль.');
        }
    })
    .then(data => {
        errorMessage.textContent = ""; 

        const successMessage = document.createElement("div");
        successMessage.textContent = `Успешно авторизован как ${data.role}`;
        successMessage.className = "success"; 
        errorMessage.parentNode.insertBefore(successMessage, errorMessage);

        setTimeout(() => {
            if (data.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/';  
            }
        }, 2000); // Задержка 2 секунды
    })
    .catch(error => {
        errorMessage.textContent = error.message;
        console.log("Ошибка авторизации:", error.message);
    });
});
