import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './tools.css';
import emailjs from '@emailjs/browser';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import { mockDataTeam } from '@/constants/index';
import { useTasks } from '@/contexts/taskcontext';

const PCIPage = () => {
  const supabase = useSupabaseClient();
  const { addTask } = useTasks();
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date()
  });

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleMemberChange = (event) => {
    const { value } = event.target;
    setSelectedMembers(typeof value === 'string' ? value.split(',') : value);
  };

  const handleOpenForm = () => setOpenForm(!openForm);
  const toggleDropdown = () => setIsOpen(!isOpen);

  // ✅ Save new task to Supabase
  const handleAddEvent = async () => {
  try {
     console.log('Inserting task:', {
  title: newEvent.title,
  start: newEvent.start.toISOString(),
  end: newEvent.end.toISOString(),
  assigned_to: selectedMembers.join(', '),
  status: 'Not Started',
  standard: 'pci',
});
    const {data, error } = await supabase.from('tasks').insert([{
      title: newEvent.title,
      start: newEvent.start.toISOString(),
      end: newEvent.end.toISOString(),
      standard: 'pci', // or 'pci', etc. — hardcode or dynamically set
      assigned_to: selectedMembers.join(', '),
      status: 'Not Started'
    }]).select();

    if (error) throw error;
    addTask(data[0]);
    alert('Task created!');
    setOpenForm(false);
    setNewEvent({ title: '', start: new Date(), end: new Date(), message: '' });
    setSelectedMembers([]);
  } catch (err) {
    console.error('Error adding task:', err);
    alert('Failed to add task: ' + err.message);
    return;
  }
  useEffect(() => {
  fetchEvents();
}, []);

  // ✅ Send email notifications
  await Promise.all(selectedMembers.map(async (memberName) => {
    const member = mockDataTeam.find((m) => m.name === memberName);
    if (!member?.email) return;

    const templateParams = {
      to_email: member.email,
      name: memberName,
      time: new Date().toLocaleString(),
      title: newEvent.title,
      message: `You have been assigned a new task: ${newEvent.title}\nStart: ${newEvent.start.toLocaleString()}\nEnd: ${newEvent.end.toLocaleString()}`
    };

    try {
      await emailjs.send(
        'service_zlvrbn9',
        'template_osgthn8',
        templateParams,
        'o6wnQCmZnnJvdxCKG'
      );
    } catch (err) {
      console.error(`Email failed for ${memberName}:`, err.message);
    }
  }));

};

  // ✅ Fetch events filtered by standard
const fetchEvents = async () => {
  console.log('Fetching events from table:', 'tasks');
  const { data, error } = await supabase
    .from("tasks")
    .select('*')
    .eq('standard', 'pci');

  if (error) {
    // console.error('Fetch Error:', error.code, error.message, error.details);
    return [];
  }
  console.log('Fetched data:', data);
  return data;
};
useEffect(() => {
  const getEvents = async () => {
    const fetched = await fetchEvents(); // you defined this
    setEvents(fetched); // 🔑 update local state to reflect changes
  };

  getEvents();
}, []);


  // ✅ Delete task by ID
  const handleDeleteEvent = async (eventId) => {
    const { error } = await supabase
      .from('tasks')
      .delete()      
      .eq('id', eventId);

    if (error) {
      alert('Error deleting event');
    } else {
      fetchEvents();
    }
    setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));
  };



  return (
    <div className="Page">
      <h1 className="title">PCI PAGE</h1>
      <p className="description">This is the standard task page for PCI</p>

      <h2 className="section-title" onClick={toggleDropdown}>Tasks</h2>
      {isOpen && (
        <div>
          <div className="task-sections">
            {events.map((event) => (
              <div className="task-item" key={event.id}>
                <div className="task-info">
                  <div className="task-name">{event.summary}</div>
                  <div className="task-coordinator">{event.assigned_to}</div>
                  <div className="task-frequency">
                    {new Date(event.start).toLocaleString()} -{' '}
                    {new Date(event.end).toLocaleString()}
                  </div>
                </div>
                <div className="task-meta">
                  <div className="task-status bg-green-500 text-white">Started</div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {openForm && (
            <div className="input-row mt-6">
              <div className="input-row-1">
                <h2 className="labels">Event Title</h2>
                <input
                  className="event-title-input"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
                <h2 className="labels">Start Date</h2>
                <DatePicker
                  selected={newEvent.start}
                  onChange={(start) => setNewEvent({ ...newEvent, start })}
                  showTimeSelect
                  dateFormat="Pp"
                  className="date-picker"
                />
              </div>

              <div className="input-row-2">
                <h2 className="labels">End Date</h2>
                <DatePicker
                  selected={newEvent.end}
                  onChange={(end) => setNewEvent({ ...newEvent, end })}
                  showTimeSelect
                  dateFormat="Pp"
                  className="date-picker"
                />
                <FormControl sx={{ minWidth: 200, marginLeft: 15 }}>
                  <InputLabel>Assign Members</InputLabel>
                  <Select
                    multiple
                    value={selectedMembers}
                    onChange={handleMemberChange}
                    input={<OutlinedInput label="Assign Members" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {mockDataTeam.map((member) => (
                      <MenuItem key={member.id} value={member.name}>
                        <Checkbox checked={selectedMembers.includes(member.name)} />
                        <ListItemText primary={member.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <button className="add-event-button" onClick={handleAddEvent}>
                Add Event
              </button>
            </div>
          )}
          <button
            className="create-form bg-blue-900 text-white rounded-lg p-4 cursor-pointer"
            onClick={handleOpenForm}
          >
            Create Form
          </button>
        </div>
      )}
    </div>
  );
};

export default PCIPage;

