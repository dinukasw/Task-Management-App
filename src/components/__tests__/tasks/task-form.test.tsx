import { render, screen, waitFor } from "@/__tests__/utils/test-utils";
import userEvent from "@testing-library/user-event";
import { TaskForm } from "@/components/tasks/task-form";

// Mock fetch
global.fetch = jest.fn();

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("TaskForm", () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("Create Mode", () => {
    it("should render create task form", () => {
      render(<TaskForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /create task/i })).toBeInTheDocument();
    });

    it("should show validation error for short title", async () => {
      const user = userEvent.setup();
      render(<TaskForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByLabelText(/task title/i);
      const submitButton = screen.getByRole("button", { name: /create task/i });

      await user.type(titleInput, "AB");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it("should create task successfully", async () => {
      const user = userEvent.setup();
      const mockTask = {
        id: "task-1",
        title: "New Task",
        description: "Task Description",
        status: "PENDING",
        userId: "user-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockTask,
        }),
      });

      render(<TaskForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByLabelText(/task title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const submitButton = screen.getByRole("button", { name: /create task/i });

      await user.type(titleInput, "New Task");
      await user.type(descriptionInput, "Task Description");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "New Task",
            description: "Task Description",
            status: "PENDING",
          }),
        });
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("Edit Mode", () => {
    const mockTask = {
      id: "task-1",
      title: "Existing Task",
      description: "Existing Description",
      status: "PENDING" as const,
      userId: "user-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it("should render edit task form with existing data", () => {
      render(<TaskForm task={mockTask} onSuccess={mockOnSuccess} />);

      expect(screen.getByDisplayValue("Existing Task")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Existing Description")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /update task/i })).toBeInTheDocument();
    });

    it("should update task successfully", async () => {
      const user = userEvent.setup();
      const updatedTask = {
        ...mockTask,
        title: "Updated Task",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: updatedTask,
        }),
      });

      render(<TaskForm task={mockTask} onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByLabelText(/task title/i);
      const submitButton = screen.getByRole("button", { name: /update task/i });

      await user.clear(titleInput);
      await user.type(titleInput, "Updated Task");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/tasks/task-1", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Updated Task",
            description: "Existing Description",
            status: "PENDING",
          }),
        });
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("should show delete button in edit mode", () => {
      render(<TaskForm task={mockTask} onSuccess={mockOnSuccess} />);

      expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    });

    it("should disable status select for completed tasks", () => {
      const completedTask = {
        ...mockTask,
        status: "COMPLETED" as const,
      };

      render(<TaskForm task={completedTask} onSuccess={mockOnSuccess} />);

      const statusSelect = screen.getByLabelText(/status/i);
      expect(statusSelect).toBeDisabled();
    });

    it("should delete task successfully", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
          }),
        });

      render(<TaskForm task={mockTask} onSuccess={mockOnSuccess} />);

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(deleteButton);

      // Confirm deletion in dialog
      const confirmButton = await screen.findByRole("button", { name: /^delete$/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/tasks/task-1", {
          method: "DELETE",
        });
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  it("should handle API errors gracefully", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: "Invalid input data",
      }),
    });

    render(<TaskForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText(/task title/i);
    const submitButton = screen.getByRole("button", { name: /create task/i });

    await user.type(titleInput, "New Task");
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

