function cargarNotas() {
  const id_user = localStorage.getItem("ActualUserId");

  if (!id_user) {
    console.error("ID de usuario no encontrado en localStorage");
    return;
  }

  fetch(`http://localhost:3000/backend/user-notes/${id_user}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Error al obtener las notas del usuario");
      }
      return res.json();
    })
    .then((notas) => {
      notas.forEach((nota) => {
        const note = document.createElement("div");

        const titulo = document.createElement("h2");
        titulo.textContent = nota.Title;

        const cuerpo = document.createElement("h3");
        cuerpo.textContent = nota.Body;

        note.appendChild(titulo);
        note.appendChild(cuerpo);

        document.querySelector(".noteContainer").appendChild(note);
      });
    })
    .catch((err) => {
      console.error("Error al cargar notas:", err);
    });
}


if  (window.location.pathname.endsWith('index.html')){
  

let notero = document.querySelector(".noteContainer"); 

let note = document.createElement("div");

let inputHeader = document.createElement("input");
inputHeader.setAttribute("class", "header");

let inputBody = document.createElement("input");
inputBody.setAttribute("class", "body");

var ActualUser = localStorage.getItem("ActualUser");
var idUser = localStorage.getItem("ActualUserId");

console.log(ActualUser);

    const userLabel = document.getElementById("user");
    const dateLabel = document.getElementById("date");
    const NoteNumer = document.getElementById("NoteNum");

    userLabel.innerHTML = ActualUser;
    dateLabel.innerHTML = new Date().toLocaleString();
    fetch(`http://localhost:3000/backend/user-notes-count/${ActualUser}`)
    .then(res => res.json())
    .then(data => {
    NoteNumer.innerHTML = `Notas: ${data.count}`;
  });
  

note.appendChild(inputHeader);
note.appendChild(inputBody);

notero.appendChild(note);
notero.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const title = inputHeader.value;
    const body = inputBody.value;


    console.log(idUser);
    fetch(`http://localhost:3000/backend/user-notes/${idUser}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    title: title,
    body: body
  }),
})
  .then((res) => res.json())
  .then((data) => {
        // Crear y agregar la nueva nota visualmente sin recargar
        const newNote = document.createElement("div");
        newNote.classList.add("note");

        const newTitle = document.createElement("h2");
        newTitle.textContent = title;

        const newBody = document.createElement("p");
        newBody.textContent = body;

        newNote.appendChild(newTitle);
        newNote.appendChild(newBody);
        notero.appendChild(newNote);

        // Limpiar los inputs
        inputHeader.value = "";
        inputBody.value = "";

        

        alert("Nota guardada con ID: " + data.id);
      })
      .catch((error) => {
        console.error("Error al guardar nota:", error);
        alert("Ocurrió un error al guardar la nota.");
      });
  }
});


window.addEventListener("DOMContentLoaded", cargarNotas());
}







if (window.location.pathname.endsWith('singup.html')){
  document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("usuario").value.trim();
  const password = document.getElementById("contraseña").value.trim();
  const confirmPassword = document.getElementById("contraseña confirm").value.trim();

  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden");
    return;
  }

  console.log(username);
  console.log(password);
fetch('http://localhost:3000/backend/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
})
.then(res => res.json())
.then(data => {
  console.log("Registrado con éxito", data);
  window.location.href = 'login.html';
})
.catch(err => {
  console.error("Error al registrar:", err);
});
});


}

if  (window.location.pathname.endsWith('login.html')){

  document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("usuarioLogin").value;
  const password = document.getElementById("contraseñaLogin").value;

  fetch("http://localhost:3000/backend/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        console.log("usuario no existe");
        window.location.href = 'singup.html';
      } else {
        alert("Bienvenido " + data.username);
        // Redirigir a otra página si querés
        // window.location.href = 'notas.html';
        localStorage.setItem("ActualUser",data.username);
        localStorage.setItem("ActualUserId",data.id);
        window.location.href = 'index.html'
        
      }
    })
    .catch(err => {
      console.error("Error en login:", err);
    });
});

}




