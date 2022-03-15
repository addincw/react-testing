import { act, render, screen, waitFor } from "@testing-library/react";
/**
 * user-event is generally recommended because it ensures that all the events are fired in the correct order for typical user interactions.
 * This helps ensure your tests resemble the way your software is actually used.
 */
import userEvent from "@testing-library/user-event";

import TransactionCreateStepTwo from "./TransactionCreateStepTwo";

test("Pay button SHOULD disabled ON initial render", async () => {
  const compProps = {
    sender: { id: 1 },
    receiver: { id: 1 },
  };

  /**
   * When using React Testing Library, you don't need to explicitly call act() most of the time
   * because it wraps API calls with act() by default.
   */
  act(() => {
    render(<TransactionCreateStepTwo {...compProps} />);
  });

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /pay/i })).toBeDisabled();
  });
});

test("Pay button SHOULD enabled ON input amount and note filled in", async () => {
  const compProps = {
    sender: { id: 1 },
    receiver: { id: 1 },
  };

  act(() => {
    render(<TransactionCreateStepTwo {...compProps} />);
  });

  userEvent.type(screen.getByPlaceholderText(/amount/i), "500");
  userEvent.type(screen.getByPlaceholderText(/add a note/i), "For Dinner");

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /pay/i })).toBeEnabled();
  });
});

// integration test
test("User CAN see enabled pay button WHEN input amount and note filled in", async () => {
  const compProps = {
    sender: { id: 1 },
    receiver: { id: 1 },
  };

  act(() => {
    render(<TransactionCreateStepTwo {...compProps} />);
  });

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /pay/i })).toBeDisabled();
  });

  userEvent.type(screen.getByPlaceholderText(/amount/i), "500");
  userEvent.type(screen.getByPlaceholderText(/add a note/i), "For Dinner");

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /pay/i })).toBeEnabled();
  });
});
