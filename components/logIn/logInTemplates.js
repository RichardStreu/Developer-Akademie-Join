export function getLogInTemplate(email, password) {
  return /*html*/ `
    <div class="logInTemplate">
      <div class="logInTextBox">
        <p class="logInText">Log in</p>
        <div class="blueUnderlineDiv"></div>
      </div>
      <div class="logInInputArea">

      <div class="marginMinusFourteenPx">
        <input id="logInInputEmail" class="inputEmail" type="email" placeholder="Email" 
        ${email ? `value="${email}"` : ""}/>
        <div class="addTaskValidationWarning"><span id="logInInputEmailWarning"></span>&nbsp;</div>
      </div>
      <div class="marginMinusFourteenPx">
        <input id="logInInputPassword" class="inputPassword" type="password" placeholder="Password" 
        ${password ? `value="${password}"` : ""}/>
        <div class="addTaskValidationWarning"><span id="logInInputPasswordWarning"></span>&nbsp;</div>
      </div>

        <div class="checkToRememberBox">
          <input id="checkboxRememberMe" class="checkboxRememberMe" type="checkbox" />
          <p>Remember me</p>
        </div>
      </div>
      <div class="logInBtnBox">
        <button onclick="logInRegistratedUser()" class="logInBtn">Log in</button>
        <button onclick="doGuestLogIn()" class="guestLogInBtn">Guest Log In</button>
      </div>
    </div>
  `;
}

export function getSignUpTemplate() {
  return /*html*/ `
    <div class="logInTemplate">
            <div onclick="goToLogInPage()" class="backArrow">
              <svg viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13.0097 17.8855H30.1871C31.0362 17.8855 31.7246 18.5739 31.7246 19.4231C31.7246 20.2722 31.0362 20.9606 30.1871 20.9606H13.0097L20.17 28.1209C20.7704 28.7213 20.7704 29.6946 20.17 30.295C19.5697 30.8954 18.5963 30.8954 17.996 30.295L8.53824 20.8373C7.75719 20.0562 7.75719 18.7899 8.53824 18.0089L17.996 8.55115C18.5963 7.9508 19.5697 7.9508 20.17 8.55115C20.7704 9.1515 20.7704 10.1249 20.17 10.7252L13.0097 17.8855Z"
                />
              </svg>
            </div>
            <div class="logInTextBox">
              <p class="logInText">Sign up</p>
              <div class="blueUnderlineDiv"></div>
            </div>
            <div class="signUpInputArea">
            <div class="marginMinusFourteenPx">
              <input id="signUpInputName" class="inputName" type="text" placeholder="Name" />
              <div class="addTaskValidationWarning"><span id="signUpInputNameWarning"></span>&nbsp;</div>
            </div>
            <div class="marginMinusFourteenPx">
              <input id="signUpInputEmail" class="inputEmail" type="email" placeholder="Email" />
              <div class="addTaskValidationWarning"><span id="signUpInputEmailWarning"></span>&nbsp;</div>
            </div>
            <div class="marginMinusFourteenPx">
              <input id="signUpInputPassword" class="inputPassword" type="password" placeholder="Password" />
              <div class="addTaskValidationWarning"><span id="signUpInputPasswordWarning"></span>&nbsp;</div>
            </div>
            <div class="marginMinusFourteenPx">
              <input id="signUpInputPasswordRepeat" class="inputPassword" type="password" placeholder="Password" />
              <div class="addTaskValidationWarning"><span id="signUpInputPasswordRepeatWarning"></span>&nbsp;</div>
            </div>
            <div class="marginMinusFourteenPx checkToRememberContainer">
              <div class="checkToRememberBox">
                <input id="privacyPolicyCheckBox" class="checkboxRememberMe" type="checkbox" />
                <p>I accept the</p>
                <a href="./privacyPolicy.html">Privacy policy</a>
              </div>
              <div class="addTaskValidationWarning"><span id="checkBoxWarning"></span>&nbsp;</div>
            </div>
            </div>
            <div class="logInBtnBox">
              <button onclick="signUpNewUser()" id="signUpBtn" class="signUpBtn">Sign up</button>
            </div>
          </div>
  `;
}