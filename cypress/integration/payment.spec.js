import { v4 as uuidV4 } from "uuid";

const baseURL = "http://localhost:3000";
const userBalanceSelector = "[data-test=sidenav-user-balance]";

describe("payment transaction", () => {
  it("user CAN make a payment", () => {
    // user login
    cy.visit("/");
    cy.url().should("include", "/signin");

    cy.findByRole("textbox", { name: /username/i }).type("johndoe");
    cy.findByLabelText(/password/i).type("s3cret");
    cy.findByRole("button", { name: /sign in/i }).click();

    cy.url().should("eq", baseURL + "/");

    // user check account balance
    /**
     * when using get, the first promise (.then()) return jquery chaining
     * object
     */
    let currentUserBalance;
    cy.get(userBalanceSelector)
      .should("contain.text", "$")
      .then(($userBalance) => $userBalance.text())
      .then((balance) => (currentUserBalance = balance));

    // user on click new button, to make payment
    cy.findByRole("button", { name: /new/i }).click();
    cy.url().should("include", "/transaction/new");

    // user search for user account
    let targetUserName = "Devon Becker";
    cy.findByPlaceholderText(/search.../i).type(targetUserName);
    cy.findByText(targetUserName).click();

    cy.get(".MuiStepper-root")
      .find(".MuiStep-root .MuiStepLabel-active")
      .then(($stepper) => $stepper.text())
      .should("match", /payment/i);

    cy.findByRole("button", { name: /pay/i }).should("be.disabled");

    // user input amount and note, then click pay
    const paymentAmount = "5";
    const paymentNote = uuidV4();
    cy.findByPlaceholderText(/amount/i).type(paymentAmount);
    cy.findByPlaceholderText(/add a note/i).type(paymentNote);
    cy.findByRole("button", { name: /pay/i }).should("be.enabled").click();

    cy.get(".MuiBox-root")
      .then(([_, $successMessageBox]) => $successMessageBox.textContent)
      .should("match", /paid \$[1-9].* for .*/gi);

    // user return to transactions
    cy.findByRole("button", { name: /return to transactions/i }).click();
    cy.url().should("eq", baseURL + "/");

    // user going to personal payments page
    cy.findByRole("tab", { name: /mine/i }).click().should("have.class", "Mui-selected");

    cy.findByText(paymentNote).click({ force: true });
    cy.findByText(/transaction detail/i).should("be.visible");

    // user verify if payment was made
    cy.get("[data-test^=transaction-amount-")
      .then(($amount) => parseFloat($amount.text().replace(/\$|,/g, "")))
      .should("eq", paymentAmount * -1);
    cy.findByText(paymentNote).should("be.visible");

    // user verify check if amount was deducted
    cy.get(userBalanceSelector)
      .should("contain.text", "$")
      .then(($userBalance) => $userBalance.text())
      .then((balance) => {
        const balanceBeforeTransaction = parseFloat(currentUserBalance.replace(/\$|,/g, ""));
        const balanceAfterTransaction = parseFloat(balance.replace(/\$|,/g, ""));

        return balanceAfterTransaction - balanceBeforeTransaction;
      })
      .should("eq", parseFloat(paymentAmount) * -1);
  });
});
