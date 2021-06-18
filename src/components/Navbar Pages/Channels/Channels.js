import React, { useRef, useState, useEffect } from "react";
import {
  Container,
  Form,
  Card,
  Button,
  Alert,
  Row,
  Badge,
  Col,
} from "react-bootstrap";
import NavigationBar from "../NavigationBar/NavigationBar";
import { firebase } from "@firebase/app";
import Popup from "./Popup";
import InviteList from "./InviteList";
import dateRange from "./dateRange";

export default function Channels() {
  const nameRef = useRef();
  const descriptionRef = useRef();
  const locationRef = useRef();
  const startDateRef = useRef();
  const endDateRef = useRef();

  const db = firebase.firestore();
  //console.log(db)
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const hostName = firebase.auth().currentUser?.displayName;
  const currentUserEmail = firebase.auth().currentUser?.email;

  //----------------- Pop up submission -----------------//
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoader(true);
    setError("");
    setSuccess("");
    const emails = findAll();
    const dates = dateRange(
      startDateRef.current.value,
      endDateRef.current.value
    );

    db.collection("channelsCreatedByUser")
      //.doc(currentUserEmail)
      //.collection("channels")
      .add({
        host: hostName, //User who created Channel
        name: nameRef.current.value, //Name of Event
        description: descriptionRef.current.value, //Description of Event
        location: locationRef.current.value, //Location of Event
        start_date: startDateRef.current.value, //Start Date of Event
        end_date: endDateRef.current.value, // End Date of Event
        dateRange: dates, //Dates in between Start Date & End Date of Event
        counterForDates: new Array(dates.length).fill(0), //Counter for Date Date
        busyUsersForDates: new Array(dates.length).fill(""), //Busy List for Each Date
        invitedEmails: emails, //List of Invited Users
        respondedEmails: [], //List of Responded Users
        pendingEmails: emails, //List of Pending Users
        decidedOutcome: "None yet", //Outcome
      })
      .then((docRef) => {
        //console.log(docRef);
        //console.log(docRef.id);
        db.collection("channelsCreatedByUser")
          //.doc(currentUserEmail)
          // .collection("channels")
          .doc(docRef.id)
          .update({
            documentID: docRef.id, //Adding documentID to document (Purpose: to update)
          });

        setLoader(false);
        setSuccess("Your channel has been created");
        console.log(
          "Channel requisite information has been added to firestore"
        );
      })
      .catch((error) => {
        setError("Your channel has not been created, please try again!");
        setLoader(false);
      });
  };
  //End of Pop up submission
  //-------------------------------------------//

  const [buttonPopup, setButtonPopup] = useState(false);

  //-------------------------------------------//
  const [channels, setChannels] = useState([]);
  const [loadingx, setLoading] = useState(false);

  //------------------------REF SNAPSHOT----------------------//
  const ref = firebase.firestore().collection("channelsCreatedByUser");
  //.doc(currentUserEmail) //can't use currentUserEmail here
  //.collection("channels");

  //---------------------Obtaining emailAddresses by form input fields---------------------//
  function findAll() {
    const emailAddresses = [];
    var inputs = document.getElementsByName("emailAddress");
    for (var i = 0; i < inputs.length; i++) {
      emailAddresses.push(inputs[i].value);
      //console.log(inputs[i].value);
    }
    //console.log(emailAddresses.toString());
    return emailAddresses;
  }

  //---------------------Display Invited List---------------------//
  function displayUsersList(arr) {
    const userList = arr.map((email, index) => <li key={index}>{email}</li>);
    return userList;
  }

  //--------------------------[ Reading Data from Firestore ]--------------------------//
  const userBusyDates = []; //User Busy Dates
  var docRef = db.collection("busyDates").doc(currentUserEmail);

  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        //console.log("Document read!");
        for (var i = 0; i < doc.data().dates.length; i++) {
          userBusyDates.push(doc.data().dates[i]);
        }
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
  //console.log(userBusyDates);

  //------------------------------------------*** [Agree to Sync Implementation] ***------------------------------------------//
  const handleAgreeToSync = (channel) => {
    //Check if user is under responded list already
    const respondedEmails = [...channel.respondedEmails]; //Responded Emails Array
    const userHasResponded = respondedEmails.includes(currentUserEmail);
    console.log(userBusyDates);
    if (userHasResponded === true) {
      console.log("You alr responded!");
      return;
    }
    console.log(userHasResponded);
    console.log(userBusyDates);
    //console.log(channel.documentID);
    const invitedEmails = [...channel.invitedEmails]; //Invited Emails Array
    console.log(respondedEmails);
    respondedEmails.push(currentUserEmail); //Update Responded Email Array
    const pendingEmails = invitedEmails.filter(
      //Filter out duplicates (Invited - Responded) for Pending
      //Update Pending List
      (val) => !respondedEmails.includes(val)
    );
    console.log(pendingEmails);
    const dateRange = [...channel.dateRange]; //dateRange Array
    const updateCounterDates = [...channel.counterForDates]; //counterForDateRange Array (renamed to prevent clashing of var names)
    const updateBusyUsersForDates = [...channel.busyUsersForDates]; //busyUsersForDates Array (renamed to prevent clashing of var names)
    console.log(dateRange);
    var index = 0;
    for (index = 0; index < dateRange.length; index++) {
      for (var k = 0; k < userBusyDates.length; k++) {
        if (userBusyDates[k] === dateRange[index]) {
          console.log("Busy Date: " + dateRange[index]);
          updateCounterDates[index]++; //Increment busy counter of array element
          //console.log(counterForDates[index]);
          updateBusyUsersForDates[index] += currentUserEmail + " "; //Append user email to the array element (busy)
        }
      }
    }
    console.log(updateCounterDates);
    console.log(updateBusyUsersForDates);

    db.collection("channelsCreatedByUser")
      //.doc(currentUserEmail)
      //.collection("channels")
      .doc(channel.documentID)
      .update({
        counterForDates: updateCounterDates, //Counter for Date Date
        busyUsersForDates: updateBusyUsersForDates, //Busy List for Each Date
        invitedEmails: invitedEmails, //List of Invited Users
        respondedEmails: respondedEmails, //List of Responded Users
        pendingEmails: pendingEmails, //List of Pending Users
        //decidedOutcome: "None yet", //Outcome
      });

    //If everyone has fully responded, give the most optimal date
    if (respondedEmails.length === invitedEmails.length) {
      let lowest = updateCounterDates[0];
      let lowestIndex = 0;
      for (var z = 0; z < updateCounterDates.length; z++) {
        if (updateCounterDates[z] < lowest) {
          lowest = updateCounterDates[z];
          console.log(updateCounterDates[z] + " < " + lowest);
          lowestIndex = z;
          console.log(lowestIndex);
        }
      }
      const bestDate = dateRange[lowestIndex];
      db.collection("channelsCreatedByUser")
        .doc(channel.documentID)
        .update({
          decidedOutcome: "Most optimal date is " + bestDate + " !", //Outcome
        });
    }
  };

  //Load channels details REF SNAPSHOT
  function getChannels() {
    setLoading(true);
    ref.onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        const emails = doc.data().invitedEmails; //arr of Invited Emails
        //console.log(emails);
        const boolean = emails.indexOf(currentUserEmail) > -1; //Check if logged in user email belongs to Invited Emails
        if (boolean === true) {
          //Push channels if belongs
          items.push(doc.data());
        }
        //console.log(doc.id);
      });
      setChannels(items);
      //console.log(items);
      setLoading(false);
    });
  }

  useEffect(() => {
    getChannels();
  }, []);

  if (loadingx) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <NavigationBar />
      <div className="p-3 mb-2 bg-dark text-white">
        <Container fluid>
          <Row className="d-flex align-items-center justify-content-center mb-4">
            <Button
              style={{ width: 100, height: 60 }}
              onClick={() => setButtonPopup(true)}
            >
              {" "}
              Create an Event!{" "}
            </Button>
          </Row>
          <Row>
            <Container style={{ minHeight: "100vh" }}>
              {channels.map((channel, index) => (
                //Rendered Channels
                <div
                  key={index}
                  className="d-flex align-items-center justify-content-center mb-4"
                >
                  <Card style={{ width: 800 }}>
                    <Card.Header className="d-flex justify-content-center">
                      <Card.Title>
                        <h2>{channel.name}</h2>
                      </Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <div className="details">
                        <Row>
                          <Col xs={12} md={8}>
                            <Card.Text>
                              Description:{" "}
                              {channel.description != null
                                ? channel.description
                                : "N/A"}
                            </Card.Text>
                            <Card.Text>
                              Location:{" "}
                              {channel.location != null
                                ? channel.location
                                : "N/A"}
                            </Card.Text>
                            <Card.Text>
                              Start Date:{" "}
                              <Badge pill variant="dark">
                                {" "}
                                {channel.start_date}
                              </Badge>
                              {/*console.log(event.start.date)*/}
                            </Card.Text>
                            <Card.Text>
                              End Date:{" "}
                              <Badge pill variant="dark">
                                {channel.end_date}
                              </Badge>
                            </Card.Text>
                            <Card.Text>
                              <Button
                                variant="danger"
                                style={{ width: 260, height: 40 }}
                                onClick={() => handleAgreeToSync(channel)}
                              >
                                Agree to Sync Calendar Data
                              </Button>
                            </Card.Text>
                            <Card.Text>
                              Decided Outcome: {channel.decidedOutcome}
                            </Card.Text>
                          </Col>
                          <Col xs={6} md={4}>
                            <Card.Text>
                              Invited List:{" "}
                              {displayUsersList(channel.invitedEmails)}
                            </Card.Text>
                            <Card.Text>
                              Responded:
                              {displayUsersList(channel.respondedEmails)}
                            </Card.Text>
                            <Card.Text>
                              Pending:{displayUsersList(channel.pendingEmails)}
                            </Card.Text>
                          </Col>
                        </Row>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                //End of Rendered Channels
              ))}

              {/*Pop up */}
              <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
                <Card.Body>
                  <h3 className="text-center mb-4">
                    Create a channel for your event!
                  </h3>
                  {success && <Alert variant="success">{success}</Alert>}
                  {error && <Alert variant="danger">{error}</Alert>}
                  <form className="text-white" onSubmit={handleSubmit}>
                    <Form.Group id="name">
                      <Form.Label>Name of event</Form.Label>
                      <Form.Control
                        required
                        type="name"
                        ref={nameRef}
                        placeholder="eg. Study Session"
                      />
                    </Form.Group>
                    <br></br>
                    <Form.Group id="description">
                      <Form.Label>Description of event</Form.Label>
                      <Form.Control
                        required
                        type="description"
                        ref={descriptionRef}
                        placeholder="eg. Study meet with Rebecca"
                      />
                    </Form.Group>
                    <br></br>
                    <Form.Group id="location">
                      <Form.Label>Location of event</Form.Label>
                      <Form.Control
                        required
                        type="location"
                        ref={locationRef}
                        placeholder="eg. NUS Central Library 4th floor"
                      />
                    </Form.Group>
                    <br></br>
                    <Form.Group id="startDate">
                      <Form.Label>Start date</Form.Label>
                      <Form.Control
                        required
                        type="startDate"
                        ref={startDateRef}
                        placeholder="YYYY-MM-DD"
                      />
                    </Form.Group>
                    <br></br>
                    <Form.Group id="endDate">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        required
                        type="endDate"
                        ref={endDateRef}
                        placeholder="YYYY-MM-DD"
                      />
                    </Form.Group>
                    <br></br>
                    <Form.Group id="emailInvite">
                      <Form.Label>Number of People to Invite: (1-9)</Form.Label>
                      <InviteList />
                    </Form.Group>
                    <br></br>
                    <Button
                      variant="danger"
                      disabled={loading}
                      className="w-100"
                      type="submit"
                    >
                      Create channel
                    </Button>
                  </form>
                </Card.Body>
              </Popup>
              {/*End of Pop up */}
            </Container>
          </Row>
        </Container>
      </div>
    </div>
  );
}