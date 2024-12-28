import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterState, setFilterState] = useState("All");
  const [sortOption, setSortOption] = useState("None");

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const taskTitle = useRef("");
  const taskSummary = useRef("");
  const taskState = useRef("Not done");
  const taskDeadline = useRef(null);

  const stateRanking = {
    "Doing right now": 1,
    "Not done": 2,
    "Done": 3,
  };

  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current,
      deadline: taskDeadline.current.value,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function updateTask(index) {
    const updatedTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current,
      deadline: taskDeadline.current.value,
    };
    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setSelectedTask(null);
    setOpened(false);
  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function loadTasks() {
    const loadedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (loadedTasks) {
      setTasks(loadedTasks);
    }
  }

  function saveTasks(updatedTasks) {
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  }

  function sortTasks(tasksToSort) {
    switch (sortOption) {
      case "Deadline Asc":
        return tasksToSort.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      case "Deadline Desc":
        return tasksToSort.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
      case "State":
        return tasksToSort.sort((a, b) => stateRanking[a.state] - stateRanking[b.state]);
      case "Show 'Done' first":
        return tasksToSort.sort((a, b) => (b.state === "Done" ? 1 : a.state === "Done" ? -1 : 0));
      case "Show 'Doing' first":
        return tasksToSort.sort((a, b) => (b.state === "Doing right now" ? 1 : a.state === "Doing right now" ? -1 : 0));
      case "Show 'Not done' first":
        return tasksToSort.sort((a, b) => (b.state === "Not done" ? 1 : a.state === "Not done" ? -1 : 0));
      default:
        return tasksToSort;
    }
  }
  

  function filterTasks(tasksToFilter) {
    if (filterState === "All") return tasksToFilter;
    return tasksToFilter.filter((task) => task.state === filterState);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const displayedTasks = sortTasks(filterTasks([...tasks]));

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          <Modal
            opened={opened}
            size={"md"}
            title={selectedTask !== null ? "Edit Task" : "New Task"}
            withCloseButton={false}
            onClose={() => {
              setOpened(false);
              setSelectedTask(null);
            }}
            centered
          >
            <TextInput
              mt={"md"}
              ref={taskTitle}
              placeholder={"Task Title"}
              defaultValue={selectedTask !== null ? tasks[selectedTask].title : ""}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary}
              mt={"md"}
              placeholder={"Task Summary"}
              defaultValue={selectedTask !== null ? tasks[selectedTask].summary : ""}
              label={"Summary"}
            />
            <select
              defaultValue={selectedTask !== null ? tasks[selectedTask].state : "Not done"}
              onChange={(e) => (taskState.current = e.target.value)}
            >
              <option value="Done">Done</option>
              <option value="Not done">Not done</option>
              <option value="Doing right now">Doing right now</option>
            </select>
            <TextInput
              ref={taskDeadline}
              type="date"
              label="Deadline"
              defaultValue={selectedTask !== null ? tasks[selectedTask].deadline : ""}
            />
            <Group mt={"md"} position={"apart"}>
              <Button
                onClick={() => {
                  setOpened(false);
                  setSelectedTask(null);
                }}
                variant={"subtle"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  selectedTask !== null
                    ? updateTask(selectedTask)
                    : createTask();
                }}
              >
                {selectedTask !== null ? "Update Task" : "Create Task"}
              </Button>
            </Group>
          </Modal>
          <Container size={550} my={40}>
            <Group position={"apart"}>
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon
                color={"blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? <Sun size={16} /> : <MoonStars size={16} />}
              </ActionIcon>
            </Group>
            <Text weight={500} mt={"md"}>Filter</Text>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Done">Done</option>
              <option value="Not done">Not done</option>
              <option value="Doing right now">Doing right now</option>
            </select>
            <Text weight={500} mt={"md"}>Sort</Text>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="None">None</option>
              <option value="Deadline Asc">Deadline Ascending</option>
              <option value="Deadline Desc">Deadline Descending</option>
              <option value="State">State</option>
              <option value="Show 'Done' first">Show 'Done' first</option>
              <option value="Show 'Doing' first">Show 'Doing' first</option>
              <option value="Show 'Not done' first">Show 'Not done' first</option>
            </select>

            {displayedTasks.length > 0 ? (
              displayedTasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <Text weight={"bold"}>{task.state}</Text>
                    <Text weight={"bold"}>{task.deadline}</Text>
                    <ActionIcon
                      onClick={() => {
                        setSelectedTask(index);
                        setOpened(true);
                      }}
                      color={"blue"}
                      variant={"transparent"}
                    >
                      Edit
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => deleteTask(index)}
                      color={"red"}
                      variant={"transparent"}
                    >
                      <Trash />
                    </ActionIcon>
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary || "No summary was provided for this task"}
                  </Text>
                </Card>
              ))
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                You have no tasks
              </Text>
            )}
            <Button
              onClick={() => setOpened(true)}
              fullWidth
              mt={"md"}
            >
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}