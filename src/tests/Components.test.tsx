import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';
import { AppProvider } from '../context/AppContext';
import * as AppContextModule from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Dashboard } from '../pages/Dashboard';
import { LogActivity } from '../pages/LogActivity';
import { Insights } from '../pages/Insights';
import { Tips } from '../pages/Tips';
import { Assistant } from '../pages/Assistant';
import { Profile } from '../pages/Profile';
import type { AppState } from '../context/AppContext';

const mockState: AppState = {
  profile: {
    name: 'Test Tester',
    location: 'Test City',
    householdSize: 3,
    monthlyBudgetGoal: 200,
    joinedAt: new Date().toISOString(),
  },
  logs: [
    {
      date: new Date().toISOString().slice(0, 10),
      totalCo2e: 15.0,
      entries: [
        {
          id: 'mock_1',
          category: 'transport',
          subcategory: 'car_petrol',
          value: 50,
          co2e: 9.6,
          unit: 'km',
          date: new Date().toISOString().slice(0, 10),
          note: 'Petrol car commute',
        },
        {
          id: 'mock_1_dup',
          category: 'transport',
          subcategory: 'car_petrol',
          value: 10,
          co2e: 1.9,
          unit: 'km',
          date: new Date().toISOString().slice(0, 10),
        },
        {
          id: 'mock_2',
          category: 'food',
          subcategory: 'beef',
          value: 0.2,
          co2e: 5.4,
          unit: 'kg',
          date: new Date().toISOString().slice(0, 10),
        },
        {
          id: 'mock_unusual',
          category: 'energy',
          subcategory: 'unusual_sub',
          value: 10,
          co2e: 0.0,
          unit: 'kWh',
          date: new Date().toISOString().slice(0, 10),
        },
      ],
    },
    {
      date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      totalCo2e: 2.0,
      entries: [
        {
          id: 'mock_3',
          category: 'waste',
          subcategory: 'waste_landfill',
          value: 3.4,
          co2e: 2.0,
          unit: 'kg',
          date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        },
      ],
    },
    {
      date: '2026-05-15',
      totalCo2e: 4.0,
      entries: [
        {
          id: 'mock_old',
          category: 'energy',
          subcategory: 'electricity',
          value: 10,
          co2e: 4.0,
          unit: 'kWh',
          date: '2026-05-15',
        },
      ],
    },
  ],
  chatHistory: [
    {
      id: 'chat_1',
      role: 'user',
      content: 'Hello bot',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'chat_2',
      role: 'assistant',
      content: 'Hello! I am **EcoBot**.',
      timestamp: new Date().toISOString(),
    },
  ],
  currentPage: 'dashboard',
  earnedAchievements: ['first-log'],
};

describe('UI Components', () => {
  describe('Button', () => {
    it('renders and fires onClick', () => {
      const clickSpy = vi.fn();
      render(<Button onClick={clickSpy}>Test Button</Button>);
      const btn = screen.getByRole('button', { name: 'Test Button' });
      expect(btn).toBeTruthy();
      fireEvent.click(btn);
      expect(clickSpy).toHaveBeenCalledOnce();
    });

    it('renders left and right icons, loading, and disabled states', () => {
      const { rerender } = render(
        <Button leftIcon={<span>👈</span>} rightIcon={<span>👉</span>}>
          Icons
        </Button>
      );
      expect(screen.getByText('👈')).toBeTruthy();
      expect(screen.getByText('👉')).toBeTruthy();

      rerender(<Button loading>Loading</Button>);
      const loadingBtn = screen.getByRole('button') as HTMLButtonElement;
      expect(loadingBtn.disabled).toBe(true);
      expect(loadingBtn.getAttribute('aria-busy')).toBe('true');

      rerender(<Button disabled>Disabled</Button>);
      expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe('Card', () => {
    it('renders with children, custom className, and header', () => {
      render(
        <Card className="custom-card">
          <CardHeader title="Test Card Title" subtitle="Test Card Subtitle" icon="ℹ️" titleId="card-t" />
          <p>Card content</p>
        </Card>
      );
      expect(screen.getByText('Test Card Title')).toBeTruthy();
      expect(screen.getByText('Test Card Subtitle')).toBeTruthy();
      expect(screen.getByText('ℹ️')).toBeTruthy();
      expect(screen.getByText('Card content')).toBeTruthy();
    });
  });

  describe('Badge', () => {
    it('renders children with variant classes', () => {
      const { rerender } = render(<Badge variant="green">Green badge</Badge>);
      expect(screen.getByText('Green badge').className).toContain('bg-green-100');

      rerender(<Badge variant="amber">Amber badge</Badge>);
      expect(screen.getByText('Amber badge').className).toContain('bg-amber-100');
    });
  });

  describe('ProgressBar', () => {
    it('renders values and handles custom label and value boundaries', () => {
      const { rerender } = render(<ProgressBar value={40} max={100} label="Test Progress" showLabel />);
      expect(screen.getByText('Test Progress')).toBeTruthy();
      expect(screen.getByText('40%')).toBeTruthy();

      // Check clamp boundaries (value > max)
      rerender(<ProgressBar value={120} max={100} showLabel />);
      expect(screen.getByText('100%')).toBeTruthy();

      // Check clamp boundaries (value < 0)
      rerender(<ProgressBar value={-50} max={100} showLabel />);
      expect(screen.getByText('0%')).toBeTruthy();
    });
  });
});

describe('Pages and Main Routing Flow', () => {
  it('renders all page sections in App and triggers all nav paths', async () => {
    localStorage.setItem('ecotrack_state_v2', JSON.stringify(mockState));

    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    // Initial load checks Dashboard welcome header
    expect(screen.getByText(/Welcome back, Test/i)).toBeTruthy();

    // Perform clicks on all desktop and mobile navigation bar items
    const navButtons = screen.getAllByRole('button');
    navButtons.forEach((btn) => {
      act(() => {
        fireEvent.click(btn);
      });
    });

    // Check we navigated successfully through the links and ended up on Profile (last button in list)
    expect(screen.getByRole('heading', { name: 'Profile', level: 1 })).toBeTruthy();
  });

  it('handles fallback default page routing', () => {
    localStorage.setItem(
      'ecotrack_state_v2',
      JSON.stringify({
        ...mockState,
        currentPage: 'invalid_page' as any,
      })
    );
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );
    // Falls back to Dashboard
    expect(screen.getByText(/Welcome back, Test/i)).toBeTruthy();
  });

  describe('Dashboard Page details', () => {
    it('displays goal progress and handles action clicks', () => {
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(mockState));
      render(
        <AppProvider>
          <Dashboard />
        </AppProvider>
      );
      expect(screen.getByText('Monthly Goal Progress')).toBeTruthy();
      expect(screen.getByText(/17.0 of 200 kg CO₂e/i)).toBeTruthy();

      // Click quick action buttons
      fireEvent.click(screen.getByRole('button', { name: 'Log a new carbon activity' }));
      fireEvent.click(screen.getByRole('button', { name: 'Open AI assistant for personalised tips' }));
      fireEvent.click(screen.getByRole('button', { name: 'View detailed insights' }));
      fireEvent.click(screen.getByRole('button', { name: 'Browse eco-friendly tips' }));
    });

    it('displays empty state if logs array is empty and handles button click', () => {
      const emptyState = { ...mockState, logs: [] };
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(emptyState));
      render(
        <AppProvider>
          <Dashboard />
        </AppProvider>
      );
      expect(screen.getByText('Start Your Eco Journey')).toBeTruthy();
      
      // Click start journey button
      fireEvent.click(screen.getByRole('button', { name: 'Log your first activity' }));
    });

    it('covers all budget goal status branches and colors', () => {
      const useAppSpy = vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
        state: mockState,
        navigate: vi.fn(),
        updateProfile: vi.fn(),
        addEntry: vi.fn(),
        deleteEntry: vi.fn(),
        addChatMessage: vi.fn(),
        clearChat: vi.fn(),
        totalMonthCo2e: 160.0,
        todayCo2e: 0,
        categoryBreakdown: { transport: 0, energy: 0, food: 0, shopping: 0, waste: 0 },
      });
      const { rerender } = render(<Dashboard />);
      expect(screen.getByText('80% of monthly goal used')).toBeTruthy();

      useAppSpy.mockReturnValue({
        state: mockState,
        navigate: vi.fn(),
        updateProfile: vi.fn(),
        addEntry: vi.fn(),
        deleteEntry: vi.fn(),
        addChatMessage: vi.fn(),
        clearChat: vi.fn(),
        totalMonthCo2e: 210.0,
        todayCo2e: 0,
        categoryBreakdown: { transport: 0, energy: 0, food: 0, shopping: 0, waste: 0 },
      });
      rerender(<Dashboard />);
      expect(screen.getByText('100% of monthly goal used')).toBeTruthy();
      expect(screen.getByText(/Exceeded goal by/i)).toBeTruthy();

      useAppSpy.mockRestore();
    });
  });

  describe('LogActivity Page form logic and submission', () => {
    it('submits valid entries, triggers success estimates, and deletes logged activity', async () => {
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(mockState));
      vi.useFakeTimers();

      render(
        <AppProvider>
          <LogActivity />
        </AppProvider>
      );

      // Verify recent logs render with emission factors labels
      expect(screen.getAllByText('Car (petrol/gasoline)')[0]).toBeTruthy();
      // Verify unusual subcategory fallback is rendered
      expect(screen.getByText('unusual_sub')).toBeTruthy();

      // Delete unusual entry to cover factor?.label fallback branch
      const unusualDeleteBtn = screen.getByRole('button', { name: 'Delete entry: unusual_sub' });
      act(() => {
        fireEvent.click(unusualDeleteBtn);
      });

      // Category filter click
      const transportBtn = screen.getByRole('button', { name: /Select Transport category/i });
      fireEvent.click(transportBtn);

      // Select Activity Type
      const select = screen.getByLabelText(/Activity Type/i);
      fireEvent.change(select, { target: { value: 'car_diesel' } });

      // Input Amount
      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '100' } });

      // Input Date
      const dateInput = screen.getByLabelText(/Date/i);
      fireEvent.change(dateInput, { target: { value: '2026-06-12' } });

      // Input Note
      const noteInput = screen.getByLabelText(/Note/i);
      fireEvent.change(noteInput, { target: { value: 'diesel test commute' } });

      // Estimated value check
      expect(screen.getByText(/Estimated: 17.100 kg CO₂e/i)).toBeTruthy();

      // Submit Form
      const submitBtn = screen.getByRole('button', { name: 'Save this carbon activity' });
      act(() => {
        fireEvent.click(submitBtn);
      });

      // Verify Success Toast is present
      expect(screen.getByText(/Activity logged!/i)).toBeTruthy();

      // Fast forward fake timers for success toast timeout
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(screen.queryByText(/Activity logged!/i)).toBeNull();

      // Submit another entry with an empty note to cover note.trim() || undefined branch
      fireEvent.change(select, { target: { value: 'car_electric' } });
      fireEvent.change(amountInput, { target: { value: '50' } });
      fireEvent.change(dateInput, { target: { value: '2026-06-12' } });
      fireEvent.change(noteInput, { target: { value: '' } });
      act(() => {
        fireEvent.click(submitBtn);
      });
      expect(screen.getByText(/Activity logged!/i)).toBeTruthy();
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Delete entry
      const deleteButtons = screen.getAllByRole('button', { name: /Delete entry/i });
      act(() => {
        fireEvent.click(deleteButtons[0]);
      });

      vi.useRealTimers();
    });

    it('displays inline errors for invalid form state', () => {
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(mockState));
      render(
        <AppProvider>
          <LogActivity />
        </AppProvider>
      );

      const submitBtn = screen.getByRole('button', { name: 'Save this carbon activity' });

      // Submit without selecting activity
      act(() => {
        fireEvent.click(submitBtn);
      });
      expect(screen.getByRole('alert').textContent).toContain('Please select an activity type.');

      // Select activity type but submit with empty amount
      const select = screen.getByLabelText(/Activity Type/i);
      fireEvent.change(select, { target: { value: 'car_electric' } });
      act(() => {
        fireEvent.click(submitBtn);
      });
      expect(screen.getByRole('alert').textContent).toContain('Please enter a valid positive amount.');

      // Input amount but clear date
      const amountInput = screen.getByLabelText(/Amount/i);
      fireEvent.change(amountInput, { target: { value: '10' } });
      const dateInput = screen.getByLabelText(/Date/i);
      fireEvent.change(dateInput, { target: { value: '' } });
      act(() => {
        fireEvent.click(submitBtn);
      });
      expect(screen.getByRole('alert').textContent).toContain('Please select a date.');
    });
  });

  describe('Insights Page details', () => {
    it('displays monthly trends, streaks, and top emitting activities', () => {
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(mockState));
      render(
        <AppProvider>
          <Insights />
        </AppProvider>
      );
      expect(screen.getByText('Logging Streak')).toBeTruthy();
      expect(screen.getByText('Top Emitting Activities')).toBeTruthy();
      expect(screen.getByText('Emissions by Category')).toBeTruthy();
    });
    
    it('displays empty state if logs are empty', () => {
      const emptyState = { ...mockState, logs: [] };
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(emptyState));
      render(
        <AppProvider>
          <Insights />
        </AppProvider>
      );
      expect(screen.getByText('No data yet')).toBeTruthy();
    });

    it('covers vsGlobalSaving above average branch', () => {
      const useAppSpy = vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
        state: mockState,
        navigate: vi.fn(),
        updateProfile: vi.fn(),
        addEntry: vi.fn(),
        deleteEntry: vi.fn(),
        addChatMessage: vi.fn(),
        clearChat: vi.fn(),
        totalMonthCo2e: 500.0,
        todayCo2e: 0,
        categoryBreakdown: { transport: 100, energy: 200, food: 100, shopping: 50, waste: 50 },
      });
      render(<Insights />);
      expect(screen.getByText(/above global average/i)).toBeTruthy();
      useAppSpy.mockRestore();
    });
  });

  describe('Tips Page details', () => {
    it('allows category and difficulty filtering, saved pluralization, and empty filters states', () => {
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(mockState));
      render(
        <AppProvider>
          <Tips />
        </AppProvider>
      );

      // Filter by Transport category button
      const filterBtn = screen.getByRole('button', { name: /Filter by Transport/i });
      fireEvent.click(filterBtn);

      // Filter by Medium difficulty button
      const diffBtn = screen.getByRole('button', { name: /Filter by medium difficulty/i });
      fireEvent.click(diffBtn);

      // Find the Save button on first 2 tips and save both to check pluralization text
      const saveBtns = screen.getAllByRole('button', { name: /Save "/i });
      fireEvent.click(saveBtns[0]);
      fireEvent.click(saveBtns[1]);

      // Check saved banner shows plural tips saving
      expect(screen.getByText(/2 tips saved/i)).toBeTruthy();

      // Click again to unsave one
      fireEvent.click(saveBtns[0]);
      expect(screen.getByText(/1 tip saved/i)).toBeTruthy();
      fireEvent.click(saveBtns[1]);
      expect(screen.queryByText(/tip saved/i)).toBeNull();
      
      // Filter by Transport and Hard to get exactly 1 tip (Switch to electric vehicle)
      const transFilter = screen.getByRole('button', { name: /Filter by Transport/i });
      fireEvent.click(transFilter);
      const hardFilter2 = screen.getByRole('button', { name: /Filter by hard difficulty/i });
      fireEvent.click(hardFilter2);
      expect(screen.getByText('Showing 1 tip')).toBeTruthy();

      // Reset filter category to Waste and difficulty to Hard to get empty list
      const wasteFilter = screen.getByRole('button', { name: /Filter by Waste/i });
      fireEvent.click(wasteFilter);
      const hardFilter = screen.getByRole('button', { name: /Filter by hard difficulty/i });
      fireEvent.click(hardFilter);
      expect(screen.getByText(/No tips match your filters/i)).toBeTruthy();
    });

    it('handles empty category breakdown and covers topCategory sorting edge cases', () => {
      const useAppSpy = vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
        state: mockState,
        navigate: vi.fn(),
        updateProfile: vi.fn(),
        addEntry: vi.fn(),
        deleteEntry: vi.fn(),
        addChatMessage: vi.fn(),
        clearChat: vi.fn(),
        totalMonthCo2e: 0,
        todayCo2e: 0,
        categoryBreakdown: {} as any,
      });

      const { rerender } = render(<Tips />);
      expect(screen.getByText(/Showing/i)).toBeTruthy();

      // Rerender with energy as top category to cover other sorting branches on line 56
      useAppSpy.mockReturnValue({
        state: mockState,
        navigate: vi.fn(),
        updateProfile: vi.fn(),
        addEntry: vi.fn(),
        deleteEntry: vi.fn(),
        addChatMessage: vi.fn(),
        clearChat: vi.fn(),
        totalMonthCo2e: 100,
        todayCo2e: 0,
        categoryBreakdown: { transport: 10, energy: 50, food: 0, shopping: 0, waste: 0 },
      });
      rerender(<Tips />);
      expect(screen.getByText(/Showing/i)).toBeTruthy();

      useAppSpy.mockRestore();
    });
  });

  describe('Assistant Page details', () => {
    it('handles starter query prompts, typing animations, message logs, and clearing chats', async () => {
      const emptyChatState = { ...mockState, chatHistory: [] };
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(emptyChatState));
      vi.useFakeTimers();

      render(
        <AppProvider>
          <Assistant />
        </AppProvider>
      );

      // Starter prompt clicks
      const queryBtn = screen.getByRole('button', { name: "Ask: What's my carbon footprint?" });
      act(() => {
        fireEvent.click(queryBtn);
      });

      // Renders user message and typing indicator
      expect(screen.getAllByText("What's my carbon footprint?").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByLabelText('EcoBot is typing')).toBeTruthy();

      // Wait for reply timeout
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      // Bot typing ends
      expect(screen.queryByLabelText('EcoBot is typing')).toBeNull();

      // Send a query via keydown Enter on input
      const input = screen.getByPlaceholderText('Ask about your carbon footprint…');
      fireEvent.change(input, { target: { value: 'Enter query key' } });
      
      // Shift+Enter should be ignored
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });
      expect(screen.queryByText('Enter query key')).toBeNull();
      
      // Plain Enter should submit
      act(() => {
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: false });
      });
      expect(screen.getByText('Enter query key')).toBeTruthy();

      // Send a query via form submit
      fireEvent.change(input, { target: { value: 'help' } });
      const form = screen.getByLabelText('Send a message to EcoBot');
      act(() => {
        fireEvent.submit(form);
      });

      // Submit empty message to cover line 117 branch in Assistant.tsx
      fireEvent.change(input, { target: { value: '' } });
      act(() => {
        fireEvent.submit(form);
      });
      expect(screen.getByText('help')).toBeTruthy();

      // Click quick reply suggestion button
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });
      const suggestionBtn = screen.getAllByRole('button', { name: /Quick reply: /i })[0];
      act(() => {
        fireEvent.click(suggestionBtn);
      });

      // Clear button trigger
      const clearBtn = screen.getByRole('button', { name: 'Clear all chat messages' });
      act(() => {
        fireEvent.click(clearBtn);
      });
      expect(screen.queryByText('help')).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('Profile Page details', () => {
    it('allows editing details, validates inputs, cancels correctly, and clears app data', () => {
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(mockState));
      vi.useFakeTimers();

      render(
        <AppProvider>
          <Profile />
        </AppProvider>
      );

      // Trigger editing profile
      const editBtn = screen.getByRole('button', { name: 'Edit profile' });
      fireEvent.click(editBtn);

      // Edit inputs
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Jane Tester' } });

      const locationInput = screen.getByLabelText(/Location/i);
      fireEvent.change(locationInput, { target: { value: 'New Test City' } });

      const householdInput = screen.getByLabelText(/Household Size/i);
      fireEvent.change(householdInput, { target: { value: '5' } });

      const goalInput = screen.getByLabelText(/Monthly CO₂e Goal/i);
      fireEvent.change(goalInput, { target: { value: '150' } });

      // Save changes
      const saveBtn = screen.getByRole('button', { name: 'Save Changes' });
      act(() => {
        fireEvent.click(saveBtn);
      });

      // Renders saved toast and updated values
      expect(screen.getByText('Profile saved successfully!')).toBeTruthy();
      expect(screen.getByText('Jane Tester')).toBeTruthy();

      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(screen.queryByText('Profile saved successfully!')).toBeNull();

      // Clear all data click mock
      const clearBtn = screen.getByRole('button', { name: 'Clear all app data and reset to defaults' });
      act(() => {
        fireEvent.click(clearBtn);
      });

      vi.useRealTimers();
    });

    it('renders profile fields with empty location and singular household size', () => {
      const customState = {
        ...mockState,
        profile: {
          ...mockState.profile,
          location: '',
          householdSize: 1,
        },
      };
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(customState));
      render(
        <AppProvider>
          <Profile />
        </AppProvider>
      );
      expect(screen.getByText('—')).toBeTruthy();
      expect(screen.getByText('1 person')).toBeTruthy();
    });

    it('does not clear data when clear confirmation is cancelled', () => {
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(mockState));
      render(
        <AppProvider>
          <Profile />
        </AppProvider>
      );
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const clearBtn = screen.getByRole('button', { name: 'Clear all app data and reset to defaults' });
      act(() => {
        fireEvent.click(clearBtn);
      });
      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('validates profile fields input accurately', () => {
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(mockState));
      render(
        <AppProvider>
          <Profile />
        </AppProvider>
      );

      const editBtn = screen.getByRole('button', { name: 'Edit profile' });
      fireEvent.click(editBtn);

      const nameInput = screen.getByLabelText(/Name/i);
      const householdInput = screen.getByLabelText(/Household Size/i);
      const goalInput = screen.getByLabelText(/Monthly CO₂e Goal/i);
      const saveBtn = screen.getByRole('button', { name: 'Save Changes' });

      // Empty name validation
      fireEvent.change(nameInput, { target: { value: '' } });
      act(() => {
        fireEvent.click(saveBtn);
      });
      expect(screen.getByRole('alert').textContent).toContain('Name cannot be empty.');

      // Household size validation
      fireEvent.change(nameInput, { target: { value: 'Jane' } });
      fireEvent.change(householdInput, { target: { value: '25' } });
      act(() => {
        fireEvent.click(saveBtn);
      });
      expect(screen.getByRole('alert').textContent).toContain('Household size must be between 1 and 20.');

      // Monthly Goal validation
      fireEvent.change(householdInput, { target: { value: '5' } });
      fireEvent.change(goalInput, { target: { value: '5' } });
      act(() => {
        fireEvent.click(saveBtn);
      });
      expect(screen.getByRole('alert').textContent).toContain('Monthly goal must be at least 10 kg CO₂e.');

      // Reset cancel
      const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
      act(() => {
        fireEvent.click(cancelBtn);
      });
      expect(screen.getByText('Test Tester')).toBeTruthy();
    });

    it('renders all emission rating labels correctly under different logs total', () => {
      // 1. Eco Hero (< 0.5 * Global avg)
      let state = {
        ...mockState,
        logs: [{ date: new Date().toISOString().slice(0, 10), totalCo2e: 180.0, entries: [] }]
      };
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(state));
      let { unmount } = render(
        <AppProvider>
          <Profile />
        </AppProvider>
      );
      expect(screen.getByText('Eco Hero')).toBeTruthy();
      unmount();

      // 2. Below Average (< Global avg)
      state.logs[0].totalCo2e = 300.0;
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(state));
      ({ unmount } = render(
        <AppProvider>
          <Profile />
        </AppProvider>
      ));
      expect(screen.getByText('Below Average')).toBeTruthy();
      unmount();

      // 3. Above Average (< 1.5 * Global avg)
      state.logs[0].totalCo2e = 500.0;
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(state));
      ({ unmount } = render(
        <AppProvider>
          <Profile />
        </AppProvider>
      ));
      expect(screen.getByText('Above Average')).toBeTruthy();
      unmount();

      // 4. High Emitter (> 1.5 * Global avg)
      state.logs[0].totalCo2e = 800.0;
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(state));
      ({ unmount } = render(
        <AppProvider>
          <Profile />
        </AppProvider>
      ));
      expect(screen.getByText('High Emitter')).toBeTruthy();
      unmount();

      // 5. Not tracked yet (totalCo2e == 0)
      state.logs = [];
      localStorage.setItem('ecotrack_state_v2', JSON.stringify(state));
      render(
        <AppProvider>
          <Profile />
        </AppProvider>
      );
      expect(screen.getByText('Not tracked yet')).toBeTruthy();
    });
  });
});
