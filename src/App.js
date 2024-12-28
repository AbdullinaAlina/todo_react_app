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
  const [selectedTask, setSelectedTasks] = useState(null);

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
  const taskState = useRef(null);
  const taskDeadline = useRef(new Date());
  
  const [stateSort, setStateSort] = useState("None");

  const stateRanking = {
    "Done": 1,
    "Not done": 2,
    "Doing right now": 3
  }

  function createTask() {
    tasks.push({
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current.value,
      deadline: taskDeadline.current.value
    });
    setTasks(tasks);
    saveTasks(tasks);
    setOpened(false);
  }

  function updateTask(index) {
    let updatedTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current.value,
      deadline: taskDeadline.current.value
    };
    tasks.splice(index, 1, updatedTask);
    setTasks(tasks);
    saveTasks(tasks);
    setSelectedTasks(null);
    setOpened(false);
  }

  function deleteTask(index) {
    var clonedTasks = tasks;

    clonedTasks.splice(index, 1);

    setTasks(clonedTasks);
    saveTasks(clonedTasks);
  }

  function loadTasks() {
    let loadedTasks = localStorage.getItem("tasks");

    let tasks = JSON.parse(loadedTasks);

    if (tasks) {
      setTasks(tasks);
    }
  }

  function sortTasks() {
    let sortedTasks = tasks;
    sortedTasks = sortedTasks.sort((task1, task2) => stateRanking[task1.state]-stateRanking[task2.state]);
    console.log(sortedTasks);
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  useEffect(() => {
    loadTasks();
  }, [tasks]);

  useEffect(() => {
    sortTasks();
  }, [stateSort]);

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
            title={selectedTask ? "Edit Task" : "New Task"}
            withCloseButton={false}
            onClose={() => {
              setOpened(false);
              setSelectedTasks(null);
            }}
            centered
          >
            <TextInput
              mt={"md"}
              ref={taskTitle}
              placeholder={"Task Title"}
              defaultValue={selectedTask ? tasks[selectedTask].title : ""}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary}
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <select
              ref={taskState}
              defaultValue={selectedTask ? tasks[selectedTask].state : ""}
            >
              <option value="Done">Done</option>
              <option value="Not done">Not done</option>
              <option value="Doing right now">Doing right now</option>
            </select>
            <input
              ref={taskDeadline}
              type="date" 
              defaultValue={selectedTask ? tasks[selectedTask].deadline : ""}
            />
            <Group mt={"md"} position={"apart"}>
              <Button
                onClick={() => {
                  setOpened(false);
                  setSelectedTasks(null);
                }}
                variant={"subtle"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  selectedTask ? updateTask(selectedTask) : createTask();
                }}
              >
                {selectedTask ? "Update task" : "Create Task"}
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
              <select>
                <option value="None" onSelect={() => setStateSort("None")}>None</option>
                <option value="Done" onSelect={() => setStateSort("Done")}>Done</option>
                <option value="Not done" onSelect={() => setStateSort("Not done")}>Not done</option>
                <option value="Doing right now" onSelect={() => setStateSort("Doing right now")}>Doing right now</option>
            </select>
              <ActionIcon
                color={"blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <MoonStars size={16} />
                )}
              </ActionIcon>
            </Group>
            {tasks.length > 0 ? (
              tasks.map((task, index) => {
                if (task.title) {
                  return (
                    <Card withBorder key={index} mt={"sm"}>
                      <Group position={"apart"}>
                        <Text weight={"bold"}>{task.title}</Text>
                        <Text weight={"bold"}>{task.state}</Text>
                        <Text weight={"bold"}>{task.deadline}</Text>
                        <ActionIcon
                          onClick={() => {
                            deleteTask(index);
                          }}
                          color={"red"}
                          variant={"transparent"}
                        >
                          <Trash />
                        </ActionIcon>
                        <Button
                          onClick={() => {
                            setSelectedTasks(index);
                            console.log(index);
                            setOpened(true);
                          }}
                        >
                          Edit
                        </Button>
                      </Group>
                      <Text color={"dimmed"} size={"md"} mt={"sm"}>
                        {task.summary
                          ? task.summary
                          : "No summary was provided for this task"}
                      </Text>
                    </Card>
                  );
                }
              })
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                You have no tasks
              </Text>
            )}
            <Button
              onClick={() => {
                setOpened(true);
              }}
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
