### About the Demonstration

The following procedures exercise a mesh consisting of a boot node and one mesh node.  Connected to the edges of the mesh are two consumers that communicate with one another through the mesh.  These two consumers have the id's Ricky and Lucy.

Know that all communication in the transactions outlined below take place through the mesh.  All communication between two individuals is encrypted and signed for privacy.  Only the original proposal and resolution messages are broadcast to all consumers in clear text.

### Transaction Graph
Lucy_________Mesh_________Ricky
Proposal------------------------------------>
<-------------------------------Counter Offer
Counter Offer ------------------------------>
<---------------------------------Acceptance
Resolution---------------------------------->

### Launching the Mesh
1. Navigate to the mesh project directory using the terminal.
2. You can optionally remove the local cache for the peer directory for all local instances with the following command:
~~~
rm -R cache
~~~

3. Issue the following command to stand up a boot node:
~~~
node src/app.js --bootNode=true --port=50505 --refreshDirectory=true
~~~

4. Open a new terminal and navigate to the project directory.
5. Stand up a mesh node with the following command:
~~~
node src/app.js --port=1234
~~~
At this point you can observe the mesh node connecting to the boot node.  The boot node will transfer the directory of known peers to the mesh node.  This directory is cached locally for future runs so that the mesh node does not need to get the directory from the boot a second time.

Following this exchange the mesh node will see the bootnode as the only node and connect as a peer.

The boot node will also realize that it does not have an optimal number of outbound connections prompting it to also connect to the mesh node.

The mesh is now standing and ready to take consumer communication.  Any additional nodes stood up using the above command are automatically added to the directory of peers and integrated into the mesh.

### Launching the Consumers
1. Open a new terminal and navigate to the project directory.
2. Issue the following command to stand up a consumer named Lucy
~~~
node src/consumer/consumer.js --port=1222 --consumerId=lucy
~~~
The consumer is similar to a mesh node in that it first pulls a directory of known peers from the boot node saving it locally for future reference.  The consumer then makes outbound connections into the mesh.

The consumer is meant to stay on the edge of the mesh.
Unlike a mesh node the consumer does not run a server that accepts inbound connections and it does not advertise itself to the mesh.  The port number given above is used only as an identifier for caching (a copy of the functionality used in the mesh nodes).

3. Open a new terminal and navigate to the project directory.
4. Issue the following command to stand up a new consumer named Ricky:
~~~
node src/consumer/consumer.js --port=4892 --consumerId=ricky
~~~

### Communicating Through the Mesh
You observe that both consumers issue a command prompt.  At this point we can send messages through the mesh by providing a command and parameter.  For most commands that send a message the paramater provided is the JSON encoded message body.

The json provided for each command is validated against a schema.  These schemas are located in models/schemas.js.

Let's work through the transactions given at the beginning of the document.

1. Enter the following command for Lucy:
~~~
proposal { "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 1000, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : []}
~~~
Observe the mesh nodes reporting that they saw the message as it permeates the mesh.  At this point you can go to any consumer command prompt and issue the following command to see all proposals:
~~~
proposals
~~~
2. Enter a counter offer from Ricky by issuing the following command
~~~
counterOffer { "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 300, "requestAsset" : "peanuts", "requestAmount" : 600, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId": "ricky", "message": "countered", "previousHash":{"type":"Buffer","data":[139,133,222,29,209,223,183,108,242,41,97,234,80,191,245,24,83,163,42,239,102,173,66,251,43,236,104,34,188,171,68,187]}}
~~~
Note that this message contains the hash of the previous message tying them together.

3.  Let's enter a counter offer from Lucy by issuing the following command
~~~
counterOffer { "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 300, "requestAsset" : "peanuts", "requestAmount" : 800, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId": "ricky", "previousHash":{"type":"Buffer","data":[103,151,204,176,164,116,231,143,75,168,57,118,179,193,82,163,156,112,218,54,188,11,49,56,22,7,122,25,190,47,180,28]}}
~~~

At this point you can issue the following command on any consumer to see all counter offers related to their negotiation:
~~~
counterOffers abc1234
~~~
Because Lucy is the maker of this request all counter offers from all parties are displayed.  Ricky will have all counterOffers where he is indicated as the taker (not the counter offers related to other takers).

4. We'll make Ricky accept by issuing the following command:
~~~
accept { "requestId" : "abc1234", "makerId" : "lucy", "offerAsset" : "walnuts", "offerAmount" : 300, "requestAsset" : "peanuts", "requestAmount" : 600, "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : [], "takerId": "ricky", "message": "accepted", "previousHash":{"type":"Buffer","data":[69,185,53,22,0,104,213,140,177,218,85,247,190,191,177,113,222,234,68,232,248,18,236,152,52,78,26,6,113,244,163,187]}}
~~~

5. Finally, Lucy will send out a resolution letting edge consumers know that the proposal is taken down and no longer open to negotiation.
~~~
resolve { "requestId" : "abc1234", "makerId" : "lucy", "takerId": "ricky", "message": "resolved", "previousHash":{"type":"Buffer","data":[139,133,222,29,209,223,183,108,242,41,97,234,80,191,245,24,83,163,42,239,102,173,66,251,43,236,104,34,188,171,68,187]}}
~~~

### Viewing the Offer History

1. From any edge consumer you can issue the following command to see the offer history as it relates to their end of a negotiation:
~~~
offerHistory abc1234
~~~


