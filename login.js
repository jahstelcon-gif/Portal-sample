// =======================
// Firebase Connection
// =======================
const firebaseConfig = {
  apiKey: "AIzaSyB1Gbmp2j2cTfnUmuWTjcL2ypauUpQn8Qc",
  authDomain: "jahsportal.firebaseapp.com",
  databaseURL: "https://jahsportal-default-rtdb.firebaseio.com",
  projectId: "jahsportal",
  storageBucket: "jahsportal.firebasestorage.app",
  messagingSenderId: "798312139932",
  appId: "1:798312139932:web:2f6654cdd82a23406ff159",
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// =======================
// LOGIN POPUP CONTROLS
// =======================
const loginBtn = document.getElementById("login");
const popLogin = document.getElementById("pop_login");
const closeBtn = document.querySelector("#pop_login .close");

loginBtn.addEventListener("click", () => (popLogin.style.display = "flex"));
closeBtn.addEventListener("click", () => (popLogin.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === popLogin) popLogin.style.display = "none";
});

// =======================
// EMAILJS CONFIG
// =======================
(function () {
  emailjs.init("I8tvyDhY29nbwRvAE");
})();

// =======================
// JOIN POPUP CONTROLS
// =======================
const joinBtn = document.getElementById("join");
const joinPopup = document.getElementById("pop_join");
const closeJoin = document.getElementById("closeJoin");

joinBtn.addEventListener("click", () => (joinPopup.style.display = "flex"));
closeJoin.addEventListener("click", () => (joinPopup.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === joinPopup) joinPopup.style.display = "none";
});

// =======================
// GOOGLE SIGN-IN FOR JOIN FORM
// =======================
const googleJoinBtn = document.getElementById("googleJoinBtn");
const joinEmailInput = document.getElementById("join_email");

if (googleJoinBtn) {
  googleJoinBtn.addEventListener("click", async () => {
    try {
      const result = await auth.signInWithPopup(googleProvider);
      const user = result.user;
      joinEmailInput.value = user.email;

      Swal.fire({
        icon: "success",
        title: "Google Account Linked",
        text: `Signed in as ${user.email}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      Swal.fire({
        icon: "error",
        title: "Sign-in Failed",
        text: error.message,
      });
    }
  });
}

// =======================
// JOIN FORM SUBMIT
// =======================
document.getElementById("joinForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const joinEmail = joinEmailInput.value.trim().toLowerCase();
  const joinMessage = document.getElementById("join_message").value.trim();

  if (!joinEmail) {
    Swal.fire({
      icon: "warning",
      title: "Missing Email",
      text: "Please sign in with Google first.",
    });
    return;
  }

  if (joinMessage.length > 200) {
    Swal.fire({
      icon: "warning",
      title: "Message Too Long",
      text: `Your message must not exceed 200 characters. (${joinMessage.length} entered)`,
    });
    return;
  }

  try {
    Swal.fire({
      title: "Submitting your request...",
      text: "Please wait a moment.",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    await db.ref("join_requests").push({
      email: joinEmail,
      message: joinMessage,
      timestamp: new Date().toISOString(),
    });

    await emailjs.send("service_f4zsz1r", "template_re3enfm", {
      to_name: joinEmail,
      to_email: joinEmail,
    });

    Swal.fire({
      icon: "success",
      title: "Request Sent!",
      text: "Your request was submitted and a confirmation email has been sent.",
    });

    joinPopup.style.display = "none";
    document.getElementById("joinForm").reset();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Submission Failed",
      text: "There was an error submitting your request or sending confirmation.",
    });
  }
});
