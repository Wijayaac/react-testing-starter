const { v4: uuidv4 } = require("uuid");

describe("Payment flow", () => {
  it("user can make payment", () => {
    // login
    cy.visit("/");
    cy.findByRole("textbox", { name: /username/i }).type("johndoe");
    cy.findByLabelText(/password/i).type("s3cret");
    cy.findByRole("checkbox", { name: /remember me/i }).check();
    cy.findByRole("button", { name: /sign in/i }).click();

    // check account balance
    let oldBalance;
    cy.get("[data-test=sidenav-user-balance]").then(($balance) => (oldBalance = $balance.text()));
    // click new button
    cy.findByRole("button", { name: /new/i }).click();
    // search for receiver
    cy.findByRole("textbox").type("devon becker");
    cy.findByText(/devon becker/i).click();
    // add amount and note, then click pay
    const paymentAmount = "5.00";
    cy.findByPlaceholderText(/amount/i).type(paymentAmount);
    const note = uuidv4();
    cy.findByPlaceholderText(/add a note/i).type(note);
    cy.findByRole("button", { name: /pay/i }).click();
    // return to transactions
    cy.findByRole("button", { name: /return to transactions/i }).click();
    // go to personal payments
    cy.findByRole("tab", { name: /mine/i }).click();
    // click on latest payment
    cy.findByText(note).click({ force: true });
    // verify if payment was made:asserts
    cy.findByText(`-$${paymentAmount}`).should("be.visible");
    cy.findByText(note).should("be.visible");
    // verify if payment amount was deducted:asserts
    cy.get("[data-test=sidenav-user-balance]").then(($balance) => {
      const convertedOldBalance = parseFloat(oldBalance.replace(/\$|,/g, ""));
      const convertedNewBalance = parseFloat($balance.text().replace(/\$|,/g, ""));
      expect(convertedOldBalance - convertedNewBalance).to.equal(parseFloat(paymentAmount));
    });
  });
});
