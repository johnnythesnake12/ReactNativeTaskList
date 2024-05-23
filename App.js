import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
const App = () => {
  const today = new Date();
  const sevenDaysBefore = new Date(today);
  sevenDaysBefore.setDate(today.getDate() - 7);
  const initialStartDate = sevenDaysBefore.toISOString().split('T')[0];
  const [tasks, setTasks] = useState([]);
  const [expiredTasks, setExpiredTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const now = new Date();
    const expired = tasks.filter(task => new Date(task.deadline) <= now && !task.done);
    expired.sort((a,b)=>new Date(a.deadline) - new Date(b.deadline));
    console.log(expired);
    setExpiredTasks(expired);
  }, [tasks]);

  const saveTasks = async (tasks) => {
    try {
      const jsonValue = JSON.stringify(tasks);
      await AsyncStorage.setItem('tasks', jsonValue);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTasks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('tasks');
      const loadedTasks = jsonValue != null ? JSON.parse(jsonValue) : [];
      setTasks(loadedTasks);
    } catch (e) {
      console.error(e);
    }
  };

  const addTask = () => {
    const newTask = { id: uuidv4(),description, deadline, done: false };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setDescription('');
    setDeadline(new Date().toISOString().split('T')[0]);
    setIsModalVisible(false);
  };

  const toggleTaskDone = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    console.log(updatedTasks);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const filterTasksByDate = () => {
    return tasks.filter(task => {
      const taskDate = new Date(task.deadline);
      return taskDate >= new Date(startDate) && taskDate <= new Date(endDate);
    });
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.listsContainer}>
        <View style={styles.list}>
          <Text style={styles.listTitle}>Expired Tasks</Text>
          <FlatList
            data={expiredTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.expiredTask}>
                <Text>{item.description}</Text>
                <Text>Due: {new Date(item.deadline).toLocaleDateString()}</Text>
                <TouchableOpacity onPress={() => toggleTaskDone(item.id)}>
                  <Text>{item.done ? 'Mark as Undone' : 'Mark as Done'}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
        <View style={styles.list}>
          <Text style={styles.listTitle}>Filter Tasks</Text>
          <TextInput
            placeholder="Start Date (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
            style={styles.input}
          />
          <TextInput
            placeholder="End Date (YYYY-MM-DD)"
            value={endDate}
            onChangeText={setEndDate}
            style={styles.input}
          />
          <FlatList
            data={filterTasksByDate()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.task}>
                <Text>{item.description}</Text>
                <Text>Due: {new Date(item.deadline).toLocaleDateString()}</Text>
                <TouchableOpacity onPress={() => toggleTaskDone(item.id)}>
                  <Text>{item.done ? 'Mark as Undone' : 'Mark as Done'}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

      </View>
      <Button title="Add Task" onPress={() => setIsModalVisible(true)} />
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            placeholder="Task Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
          />
          <TextInput
            placeholder="Deadline (YYYY-MM-DD)"
            value={deadline}
            onChangeText={setDeadline}
            style={styles.input}
          />
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
            <View style={styles.space} /> 
            <Button title="Add Task" onPress={addTask} />

          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  listsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  list: {
    flex: 1,
    margin: 10,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  task: {
    padding: 10,
    borderBottomWidth: 1,
  },
  expiredTask: {
    padding: 10,
    borderBottomWidth: 1,
    color:'red',
    
  },
  datePicker: {
    width: '100%',
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    marginTop: 10, // or any other vertical margin you prefer
  },
  space: {
    width: 20, // or whatever size you need

  },
});

export default App;
