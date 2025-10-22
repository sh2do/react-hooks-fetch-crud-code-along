import "whatwg-fetch";
import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { resetData } from "../mocks/handlers";
import { server } from "../mocks/server";
import ShoppingList from "../components/ShoppingList";

// 🧩 Setup Mock Service Worker lifecycle
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  resetData();
});
afterAll(() => server.close());

test("displays all the items from the server after the initial render", async () => {
  render(<ShoppingList />);

  const yogurt = await screen.findByText(/Yogurt/);
  expect(yogurt).toBeInTheDocument();

  const pomegranate = await screen.findByText(/Pomegranate/);
  expect(pomegranate).toBeInTheDocument();

  const lettuce = await screen.findByText(/Lettuce/);
  expect(lettuce).toBeInTheDocument();
});

test("adds a new item to the list when the ItemForm is submitted", async () => {
  const { rerender } = render(<ShoppingList />);

  const dessertCount = screen.queryAllByText(/Dessert/i).length;

  fireEvent.change(screen.getByLabelText(/Name/i), {
    target: { value: "Ice Cream" },
  });

  fireEvent.change(screen.getByLabelText(/Category/i), {
    target: { value: "Dessert" },
  });

  // ✅ Fixed button text and switched to .click()
  fireEvent.click(screen.getByText(/Add Item/i));

  // ✅ Wait for the new item to appear
  const iceCream = await screen.findByText(/Ice Cream/i);
  expect(iceCream).toBeInTheDocument();

  const desserts = await screen.findAllByText(/Dessert/i);
  expect(desserts.length).toBe(dessertCount + 1);

  // ✅ Rerender to confirm persistence
  rerender(<ShoppingList />);

  const rerenderedIceCream = await screen.findByText(/Ice Cream/i);
  expect(rerenderedIceCream).toBeInTheDocument();
});

test("updates the isInCart status of an item when the Add/Remove from Cart button is clicked", async () => {
  const { rerender } = render(<ShoppingList />);

  const addButtons = await screen.findAllByText(/Add to Cart/i);

  expect(addButtons.length).toBe(3);
  expect(screen.queryByText(/Remove From Cart/i)).not.toBeInTheDocument();

  fireEvent.click(addButtons[0]);

  const removeButton = await screen.findByText(/Remove From Cart/i);
  expect(removeButton).toBeInTheDocument();

  rerender(<ShoppingList />);

  const rerenderedAddButtons = await screen.findAllByText(/Add to Cart/i);
  const rerenderedRemoveButtons = await screen.findAllByText(
    /Remove From Cart/i
  );

  expect(rerenderedAddButtons.length).toBe(2);
  expect(rerenderedRemoveButtons.length).toBe(1);
});

test("removes an item from the list when the delete button is clicked", async () => {
  const { rerender } = render(<ShoppingList />);

  const yogurt = await screen.findByText(/Yogurt/i);
  expect(yogurt).toBeInTheDocument();

  const deleteButtons = await screen.findAllByText(/Delete/i);
  fireEvent.click(deleteButtons[0]);

  await waitForElementToBeRemoved(() => screen.queryByText(/Yogurt/i));

  rerender(<ShoppingList />);

  const rerenderedDeleteButtons = await screen.findAllByText(/Delete/i);
  expect(rerenderedDeleteButtons.length).toBe(2);
  expect(screen.queryByText(/Yogurt/i)).not.toBeInTheDocument();
});
