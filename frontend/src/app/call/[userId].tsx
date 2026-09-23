// import React, {
//   useCallback,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import Constants from "expo-constants";
// import {
//   ActivityIndicator,
//   Alert,
//   Pressable,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";

// import AsyncStorage from "@react-native-async-storage/async-storage";

// import {
//   useLocalSearchParams,
//   useRouter,
// } from "expo-router";

// import {
//   mediaDevices,
//   RTCPeerConnection,
//   RTCIceCandidate,
//   RTCSessionDescription,
//   RTCView,
//   MediaStream,
// } from "react-native-webrtc";

// /* =========================================================
//    CONFIG
// ========================================================= */

// const API_URL =
//   process.env.EXPO_PUBLIC_API_URL ||
//   "http://192.168.1.4:5000";

// type CallType = "audio" | "video";

// type CallData = {
//   call_id: number;
//   caller_id: number;
//   receiver_id: number;
//   call_type: CallType;
//   status: string;
// };

// type SocketMessage = {
//   type: string;
//   call_id?: number;
//   caller_id?: number;
//   receiver_id?: number;
//   call_type?: CallType;
//   offer?: any;
//   answer?: any;
//   candidate?: any;
//   message?: string;
// };

// /* =========================================================
//    STUN
// ========================================================= */

// const ICE_SERVERS = [
//   {
//     urls: "stun:stun.l.google.com:19302",
//   },
// ];

// /* =========================================================
//    SCREEN
// ========================================================= */

// export default function CallScreen() {
//   const router = useRouter();

//   const params =
//     useLocalSearchParams<{
//       userId: string;
//       type?: string;
//       incoming?: string;
//       callId?: string;
//     }>();

//   const targetUserId = Number(params.userId);

//   const callType: CallType =
//     params.type === "video"
//       ? "video"
//       : "audio";

//   const isIncoming =
//     params.incoming === "true";

//   const incomingCallId =
//     params.callId
//       ? Number(params.callId)
//       : null;

//   /* =======================================================
//      STATE
//   ======================================================= */

//   const [currentUserId, setCurrentUserId] =
//     useState<number | null>(null);

//   const [callId, setCallId] =
//     useState<number | null>(
//       incomingCallId
//     );

//   const [callStatus, setCallStatus] =
//     useState(
//       isIncoming
//         ? "Incoming call..."
//         : "Connecting..."
//     );

//   const [isMuted, setIsMuted] =
//     useState(false);

//   const [localStream, setLocalStream] =
//     useState<MediaStream | null>(null);

//   const [remoteStream, setRemoteStream] =
//     useState<MediaStream | null>(null);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState<string | null>(null);

//   /* =======================================================
//      REFS
//   ======================================================= */

//   const socketRef =
//     useRef<WebSocket | null>(null);

//   const peerConnectionRef =
//     useRef<RTCPeerConnection | null>(null);

//   const localStreamRef =
//     useRef<MediaStream | null>(null);

//   const callIdRef =
//     useRef<number | null>(
//       incomingCallId
//     );

//   const mountedRef =
//     useRef(true);

//   const callEndedRef =
//     useRef(false);

//   const localTracksAddedRef =
//     useRef(false);

//   const pendingCandidatesRef =
//     useRef<any[]>([]);

//   /* =======================================================
//      KEEP CALL ID STATE + REF IN SYNC
//   ======================================================= */

//   const updateCallId = useCallback(
//     (id: number | null) => {
//       callIdRef.current = id;
//       setCallId(id);
//     },
//     []
//   );

//   /* =======================================================
//      SEND SOCKET MESSAGE
//   ======================================================= */

//   const sendSocketMessage =
//     useCallback(
//       (payload: any) => {
//         const socket =
//           socketRef.current;

//         if (
//           !socket ||
//           socket.readyState !== WebSocket.OPEN
//         ) {
//           console.log(
//             "⚠️ WebSocket is not open"
//           );

//           return false;
//         }

//         try {
//           socket.send(
//             JSON.stringify(payload)
//           );

//           return true;
//         } catch (error) {
//           console.error(
//             "❌ WebSocket send error:",
//             error
//           );

//           return false;
//         }
//       },
//       []
//     );

//   /* =======================================================
//      TOKEN
//   ======================================================= */

//   const getToken =
//     useCallback(async () => {
//       return await AsyncStorage.getItem(
//         "token"
//       );
//     }, []);

//   /* =======================================================
//      CURRENT USER
//   ======================================================= */

//   const getCurrentUser =
//     useCallback(async () => {
//       const userString =
//         await AsyncStorage.getItem(
//           "user"
//         );

//       if (!userString) {
//         return null;
//       }

//       try {
//         const user =
//           JSON.parse(userString);

//         return Number(
//           user.id ??
//             user.user_id
//         );
//       } catch {
//         return null;
//       }
//     }, []);

//   /* =======================================================
//      CREATE CALL API
//   ======================================================= */

//   const createCall =
//     useCallback(
//       async (
//         token: string
//       ): Promise<CallData> => {
//         const response =
//           await fetch(
//             `${API_URL}/api/calls`,
//             {
//               method: "POST",

//               headers: {
//                 "Content-Type":
//                   "application/json",

//                 Authorization:
//                   `Bearer ${token}`,
//               },

//               body: JSON.stringify({
//                 receiver_id:
//                   targetUserId,

//                 call_type:
//                   callType,
//               }),
//             }
//           );

//         const data =
//           await response.json();

//         if (!response.ok) {
//           throw new Error(
//             data?.message ||
//               "Failed to create call"
//           );
//         }

//         if (!data?.data?.call_id) {
//           throw new Error(
//             "Call ID was not returned by server."
//           );
//         }

//         return data.data;
//       },
//       [
//         targetUserId,
//         callType,
//       ]
//     );

//   /* =======================================================
//      ACCEPT CALL API
//   ======================================================= */

//   const acceptCall =
//     useCallback(
//       async (
//         token: string,
//         id: number
//       ) => {
//         const response =
//           await fetch(
//             `${API_URL}/api/calls/${id}/accept`,
//             {
//               method: "POST",

//               headers: {
//                 Authorization:
//                   `Bearer ${token}`,
//               },
//             }
//           );

//         const data =
//           await response.json();

//         if (!response.ok) {
//           throw new Error(
//             data?.message ||
//               "Failed to accept call"
//           );
//         }

//         return data;
//       },
//       []
//     );

//   /* =======================================================
//      REJECT CALL API
//   ======================================================= */

//   const rejectCall =
//     useCallback(
//       async (
//         token: string,
//         id: number
//       ) => {
//         try {
//           await fetch(
//             `${API_URL}/api/calls/${id}/reject`,
//             {
//               method: "POST",

//               headers: {
//                 Authorization:
//                   `Bearer ${token}`,
//               },
//             }
//           );
//         } catch (error) {
//           console.error(
//             "❌ Reject call error:",
//             error
//           );
//         }
//       },
//       []
//     );

//   /* =======================================================
//      END CALL API
//   ======================================================= */

//   const endCallApi =
//     useCallback(
//       async (
//         token: string,
//         id: number
//       ) => {
//         try {
//           await fetch(
//             `${API_URL}/api/calls/${id}/end`,
//             {
//               method: "POST",

//               headers: {
//                 Authorization:
//                   `Bearer ${token}`,
//               },
//             }
//           );
//         } catch (error) {
//           console.error(
//             "❌ End call API error:",
//             error
//           );
//         }
//       },
//       []
//     );

//   /* =======================================================
//      ADD LOCAL TRACKS
//   ======================================================= */

//   const addLocalTracks =
//     useCallback(
//       (
//         peerConnection: RTCPeerConnection,
//         stream: MediaStream
//       ) => {
//         if (
//           localTracksAddedRef.current
//         ) {
//           return;
//         }

//         const tracks =
//           stream.getTracks();

//         for (const track of tracks) {
//           peerConnection.addTrack(
//             track,
//             stream
//           );
//         }

//         localTracksAddedRef.current =
//           true;
//       },
//       []
//     );

//   /* =======================================================
//      CREATE PEER CONNECTION
//   ======================================================= */

//   const createPeerConnection =
//     useCallback(async () => {
//       if (
//         peerConnectionRef.current
//       ) {
//         return peerConnectionRef.current;
//       }

//       const peerConnection =
//         new RTCPeerConnection({
//           iceServers:
//             ICE_SERVERS,
//         });

//       /*
//        * Some react-native-webrtc versions
//        * have TypeScript definitions that don't
//        * expose addEventListener correctly.
//        *
//        * Runtime still supports it, so we use
//        * a safe cast here.
//        */

//       const peer =
//         peerConnection as any;

//       /* =================================================
//          ICE CANDIDATE
//       ================================================= */

//       peer.addEventListener(
//         "icecandidate",
//         (event: any) => {
//           if (!event?.candidate) {
//             return;
//           }

//           const currentCallId =
//             callIdRef.current;

//           if (!currentCallId) {
//             console.log(
//               "⚠️ No call ID for ICE candidate"
//             );

//             return;
//           }

//           sendSocketMessage({
//             type:
//               "call_ice_candidate",

//             call_id:
//               currentCallId,

//             receiver_id:
//               targetUserId,

//             candidate:
//               event.candidate,
//           });
//         }
//       );

//       /* =================================================
//          REMOTE TRACK
//       ================================================= */

//       peer.addEventListener(
//         "track",
//         (event: any) => {
//           console.log(
//             "📺 Remote track received"
//           );

//           const stream =
//             event?.streams?.[0];

//           if (stream) {
//             setRemoteStream(
//               stream
//             );
//           }
//         }
//       );

//       /* =================================================
//          CONNECTION STATE
//       ================================================= */

//       peer.addEventListener(
//         "connectionstatechange",
//         () => {
//           console.log(
//             "WebRTC connection:",
//             peerConnection.connectionState
//           );

//           if (
//             peerConnection.connectionState ===
//             "connected"
//           ) {
//             setCallStatus(
//               "Connected"
//             );
//           }

//           if (
//             peerConnection.connectionState ===
//               "failed" ||
//             peerConnection.connectionState ===
//               "disconnected"
//           ) {
//             setCallStatus(
//               "Connection lost"
//             );
//           }

//           if (
//             peerConnection.connectionState ===
//             "closed"
//           ) {
//             setCallStatus(
//               "Call ended"
//             );
//           }
//         }
//       );

//       /* =================================================
//          ICE CONNECTION STATE
//       ================================================= */

//       peer.addEventListener(
//         "iceconnectionstatechange",
//         () => {
//           console.log(
//             "ICE state:",
//             peerConnection.iceConnectionState
//           );

//           if (
//             peerConnection.iceConnectionState ===
//             "connected"
//           ) {
//             setCallStatus(
//               "Connected"
//             );
//           }

//           if (
//             peerConnection.iceConnectionState ===
//               "failed"
//           ) {
//             setCallStatus(
//               "Connection failed"
//             );
//           }
//         }
//       );

//       peerConnectionRef.current =
//         peerConnection;

//       return peerConnection;
//     }, [
//       sendSocketMessage,
//       targetUserId,
//     ]);

//   /* =======================================================
//      START LOCAL MEDIA
//   ======================================================= */

//   const startLocalMedia =
//     useCallback(async () => {
//       if (
//         localStreamRef.current
//       ) {
//         return localStreamRef.current;
//       }

//       try {
//         const stream =
//           await mediaDevices.getUserMedia(
//             {
//               audio: true,

//               video:
//                 callType ===
//                 "video",
//             }
//           );

//         localStreamRef.current =
//           stream;

//         setLocalStream(
//           stream
//         );

//         return stream;
//       } catch (error) {
//         console.error(
//           "❌ Media error:",
//           error
//         );

//         throw new Error(
//           "Camera or microphone permission was denied."
//         );
//       }
//     }, [callType]);

//   /* =======================================================
//      FLUSH PENDING ICE
//   ======================================================= */

//   const flushPendingCandidates =
//     useCallback(
//       async (
//         peerConnection: RTCPeerConnection
//       ) => {
//         const candidates =
//           pendingCandidatesRef.current;

//         pendingCandidatesRef.current =
//           [];

//         for (
//           const candidate of candidates
//         ) {
//           try {
//             await peerConnection.addIceCandidate(
//               new RTCIceCandidate(
//                 candidate
//               )
//             );
//           } catch (error) {
//             console.error(
//               "❌ Pending ICE error:",
//               error
//             );
//           }
//         }
//       },
//       []
//     );

//   /* =======================================================
//      HANDLE OFFER
//   ======================================================= */

//   const handleOffer =
//     useCallback(
//       async (
//         message: SocketMessage
//       ) => {
//         try {
//           console.log(
//             "📨 WebRTC offer received"
//           );

//           const peerConnection =
//             await createPeerConnection();

//           const stream =
//             localStreamRef.current ||
//             (await startLocalMedia());

//           addLocalTracks(
//             peerConnection,
//             stream
//           );

//           if (!message.offer) {
//             return;
//           }

//           await peerConnection.setRemoteDescription(
//             new RTCSessionDescription(
//               message.offer
//             )
//           );

//           await flushPendingCandidates(
//             peerConnection
//           );

//           const answer =
//             await peerConnection.createAnswer();

//           await peerConnection.setLocalDescription(
//             answer
//           );

//           const currentCallId =
//             callIdRef.current ||
//             message.call_id;

//           if (!currentCallId) {
//             throw new Error(
//               "Call ID missing while sending answer."
//             );
//           }

//           sendSocketMessage({
//             type:
//               "call_answer",

//             call_id:
//               currentCallId,

//             receiver_id:
//               message.caller_id,

//             answer,
//           });

//           setCallStatus(
//             "Connecting..."
//           );
//         } catch (error) {
//           console.error(
//             "❌ Handle offer error:",
//             error
//           );

//           setError(
//             "Unable to establish the call."
//           );
//         }
//       },
//       [
//         createPeerConnection,
//         startLocalMedia,
//         addLocalTracks,
//         flushPendingCandidates,
//         sendSocketMessage,
//       ]
//     );

//   /* =======================================================
//      HANDLE ANSWER
//   ======================================================= */

//   const handleAnswer =
//     useCallback(
//       async (
//         message: SocketMessage
//       ) => {
//         try {
//           console.log(
//             "📨 WebRTC answer received"
//           );

//           const peerConnection =
//             peerConnectionRef.current;

//           if (!peerConnection) {
//             return;
//           }

//           if (!message.answer) {
//             return;
//           }

//           await peerConnection.setRemoteDescription(
//             new RTCSessionDescription(
//               message.answer
//             )
//           );

//           await flushPendingCandidates(
//             peerConnection
//           );

//           setCallStatus(
//             "Connecting..."
//           );
//         } catch (error) {
//           console.error(
//             "❌ Handle answer error:",
//             error
//           );
//         }
//       },
//       [
//         flushPendingCandidates,
//       ]
//     );

//   /* =======================================================
//      HANDLE ICE CANDIDATE
//   ======================================================= */

//   const handleIceCandidate =
//     useCallback(
//       async (
//         message: SocketMessage
//       ) => {
//         try {
//           const candidate =
//             message.candidate;

//           if (!candidate) {
//             return;
//           }

//           const peerConnection =
//             peerConnectionRef.current;

//           if (
//             !peerConnection ||
//             !peerConnection.remoteDescription
//           ) {
//             pendingCandidatesRef.current.push(
//               candidate
//             );

//             return;
//           }

//           await peerConnection.addIceCandidate(
//             new RTCIceCandidate(
//               candidate
//             )
//           );
//         } catch (error) {
//           console.error(
//             "❌ Add ICE candidate error:",
//             error
//           );
//         }
//       },
//       []
//     );

//   /* =======================================================
//      START OUTGOING OFFER
//   ======================================================= */

//   const startOutgoingOffer =
//     useCallback(async () => {
//       try {
//         const currentCallId =
//           callIdRef.current;

//         if (!currentCallId) {
//           throw new Error(
//             "Call ID missing."
//           );
//         }

//         const peerConnection =
//           await createPeerConnection();

//         const stream =
//           localStreamRef.current ||
//           (await startLocalMedia());

//         addLocalTracks(
//           peerConnection,
//           stream
//         );

//         const offer =
//           await peerConnection.createOffer();

//         await peerConnection.setLocalDescription(
//           offer
//         );

//         const sent =
//           sendSocketMessage({
//             type:
//               "call_offer",

//             call_id:
//               currentCallId,

//             receiver_id:
//               targetUserId,

//             offer,
//           });

//         if (!sent) {
//           throw new Error(
//             "WebSocket is not connected."
//           );
//         }

//         setCallStatus(
//           "Calling..."
//         );
//       } catch (error) {
//         console.error(
//           "❌ Start offer error:",
//           error
//         );

//         setError(
//           "Unable to start the call."
//         );
//       }
//     }, [
//       createPeerConnection,
//       startLocalMedia,
//       addLocalTracks,
//       sendSocketMessage,
//       targetUserId,
//     ]);

//   /* =======================================================
//      CONNECT WEBSOCKET
//   ======================================================= */

//   const connectWebSocket =
//     useCallback(
//       async (
//         token: string
//       ): Promise<WebSocket> => {
//         return new Promise(
//           (
//             resolve,
//             reject
//           ) => {
//             const wsBaseUrl =
//               API_URL.replace(
//                 /^http/,
//                 "ws"
//               );

//             const wsUrl =
//               `${wsBaseUrl}/chat?token=${encodeURIComponent(
//                 token
//               )}`;

//             console.log(
//               "🔌 Connecting call WebSocket:",
//               wsUrl
//             );

//             const socket =
//               new WebSocket(
//                 wsUrl
//               );

//             socketRef.current =
//               socket;

//             socket.onopen = () => {
//               console.log(
//                 "✅ Call WebSocket connected"
//               );

//               resolve(socket);
//             };

//             socket.onerror = (
//               event
//             ) => {
//               console.error(
//                 "❌ Call WebSocket error:",
//                 event
//               );

//               reject(
//                 new Error(
//                   "WebSocket connection failed."
//                 )
//               );
//             };

//             socket.onclose = () => {
//               console.log(
//                 "🔌 Call WebSocket closed"
//               );
//             };

//             socket.onmessage =
//               async (event) => {
//                 try {
//                   const message: SocketMessage =
//                     JSON.parse(
//                       event.data
//                     );

//                   console.log(
//                     "📨 Call socket:",
//                     message.type
//                   );

//                   switch (
//                     message.type
//                   ) {
//                     /* =====================================
//                        CALL ACCEPTED
//                     ===================================== */

//                     case "call_accepted": {
//                       setCallStatus(
//                         "Connected"
//                       );

//                       await startOutgoingOffer();

//                       break;
//                     }

//                     /* =====================================
//                        CALL REJECTED
//                     ===================================== */

//                     case "call_rejected": {
//                       setCallStatus(
//                         "Call rejected"
//                       );

//                       Alert.alert(
//                         "Call Rejected",
//                         "The other user rejected the call.",
//                         [
//                           {
//                             text: "OK",
//                             onPress: () => {
//                               cleanup();
//                               router.back();
//                             },
//                           },
//                         ]
//                       );

//                       break;
//                     }

//                     /* =====================================
//                        CALL ENDED
//                     ===================================== */

//                     case "call_ended": {
//                       if (
//                         callEndedRef.current
//                       ) {
//                         return;
//                       }

//                       callEndedRef.current =
//                         true;

//                       setCallStatus(
//                         "Call ended"
//                       );

//                       cleanup();

//                       router.back();

//                       break;
//                     }

//                     /* =====================================
//                        CALL OFFER
//                     ===================================== */

//                     case "call_offer": {
//                       if (
//                         message.call_id
//                       ) {
//                         updateCallId(
//                           message.call_id
//                         );
//                       }

//                       await handleOffer(
//                         message
//                       );

//                       break;
//                     }

//                     /* =====================================
//                        CALL ANSWER
//                     ===================================== */

//                     case "call_answer": {
//                       await handleAnswer(
//                         message
//                       );

//                       break;
//                     }

//                     /* =====================================
//                        ICE
//                     ===================================== */

//                     case "call_ice_candidate": {
//                       await handleIceCandidate(
//                         message
//                       );

//                       break;
//                     }

//                     /* =====================================
//                        ERROR
//                     ===================================== */

//                     case "error": {
//                       console.error(
//                         "❌ Call socket error:",
//                         message
//                       );

//                       setError(
//                         message.message ||
//                           "Call error"
//                       );

//                       break;
//                     }

//                     default:
//                       break;
//                   }
//                 } catch (error) {
//                   console.error(
//                     "❌ Call socket message error:",
//                     error
//                   );
//                 }
//               };
//           }
//         );
//       },
//       [
//         startOutgoingOffer,
//         handleOffer,
//         handleAnswer,
//         handleIceCandidate,
//         updateCallId,
//         router,
//       ]
//     );

//   /* =======================================================
//      CLEANUP
//   ======================================================= */

//   const cleanup =
//     useCallback(() => {
//       console.log(
//         "🧹 Cleaning call resources"
//       );

//       /* Stop local media */

//       if (
//         localStreamRef.current
//       ) {
//         localStreamRef.current
//           .getTracks()
//           .forEach(
//             (track) => {
//               try {
//                 track.stop();
//               } catch {}
//             }
//           );

//         localStreamRef.current =
//           null;
//       }

//       /* Close peer */

//       if (
//         peerConnectionRef.current
//       ) {
//         try {
//           peerConnectionRef.current.close();
//         } catch {}

//         peerConnectionRef.current =
//           null;
//       }

//       /* Close socket */

//       if (
//         socketRef.current
//       ) {
//         try {
//           socketRef.current.close();
//         } catch {}

//         socketRef.current =
//           null;
//       }

//       localTracksAddedRef.current =
//         false;

//       pendingCandidatesRef.current =
//         [];

//       setLocalStream(
//         null
//       );

//       setRemoteStream(
//         null
//       );
//     }, []);

//   /* =======================================================
//      END CALL
//   ======================================================= */

//   const handleEndCall =
//     useCallback(async () => {
//       if (
//         callEndedRef.current
//       ) {
//         return;
//       }

//       callEndedRef.current =
//         true;

//       const id =
//         callIdRef.current;

//       const token =
//         await getToken();

//       /* API */

//       if (
//         id &&
//         token
//       ) {
//         await endCallApi(
//           token,
//           id
//         );
//       }

//       /* WebSocket */

//       if (id) {
//         sendSocketMessage({
//           type:
//             "call_end",

//           call_id:
//             id,

//           receiver_id:
//             targetUserId,
//         });
//       }

//       cleanup();

//       router.back();
//     }, [
//       getToken,
//       endCallApi,
//       sendSocketMessage,
//       targetUserId,
//       cleanup,
//       router,
//     ]);

//   /* =======================================================
//      INITIALIZE
//   ======================================================= */

//   const initialize =
//     useCallback(async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const token =
//           await getToken();

//         if (!token) {
//           throw new Error(
//             "Please login again."
//           );
//         }

//         const userId =
//           await getCurrentUser();

//         if (!userId) {
//           throw new Error(
//             "User information not found."
//           );
//         }

//         setCurrentUserId(
//           userId
//         );

//         /* Connect socket FIRST */

//         await connectWebSocket(
//           token
//         );

//         /* Start microphone/camera */

//         await startLocalMedia();

//         /* =================================================
//            INCOMING CALL
//         ================================================= */

//         if (isIncoming) {
//           const id =
//             callIdRef.current;

//           if (!id) {
//             throw new Error(
//               "Incoming call ID is missing."
//             );
//           }

//           /*
//            * Accept API
//            */

//           await acceptCall(
//             token,
//             id
//           );

//           /*
//            * Notify caller
//            */

//           sendSocketMessage({
//             type:
//               "call_accept",

//             call_id:
//               id,

//             receiver_id:
//               targetUserId,
//           });

//           setCallStatus(
//             "Connected"
//           );

//           return;
//         }

//         /* =================================================
//            OUTGOING CALL
//         ================================================= */

//         const call =
//           await createCall(
//             token
//           );

//         /*
//          * IMPORTANT:
//          * Save call ID to BOTH state and ref.
//          */

//         updateCallId(
//           call.call_id
//         );

//         /*
//          * Tell receiver that call is ringing.
//          */

//         const sent =
//           sendSocketMessage({
//             type:
//               "call_user",

//             call_id:
//               call.call_id,

//             receiver_id:
//               targetUserId,

//             call_type:
//               callType,
//           });

//         if (!sent) {
//           throw new Error(
//             "Unable to notify the other user."
//           );
//         }

//         setCallStatus(
//           "Calling..."
//         );
//       } catch (error: any) {
//         console.error(
//           "❌ Call initialization error:",
//           error
//         );

//         setError(
//           error?.message ||
//             "Unable to start call."
//         );
//       } finally {
//         if (
//           mountedRef.current
//         ) {
//           setLoading(false);
//         }
//       }
//     }, [
//       getToken,
//       getCurrentUser,
//       connectWebSocket,
//       startLocalMedia,
//       isIncoming,
//       acceptCall,
//       sendSocketMessage,
//       targetUserId,
//       createCall,
//       callType,
//       updateCallId,
//     ]);

//   /* =======================================================
//      MUTE
//   ======================================================= */

//   const toggleMute =
//     useCallback(() => {
//       const stream =
//         localStreamRef.current;

//       if (!stream) {
//         return;
//       }

//       const audioTracks =
//         stream.getAudioTracks();

//       const newMuted =
//         !isMuted;

//       audioTracks.forEach(
//         (track) => {
//           track.enabled =
//             !newMuted;
//         }
//       );

//       setIsMuted(
//         newMuted
//       );
//     }, [isMuted]);

//   /* =======================================================
//      REJECT INCOMING
//   ======================================================= */

//   const handleRejectIncoming =
//     useCallback(async () => {
//       const id =
//         callIdRef.current;

//       const token =
//         await getToken();

//       if (
//         id &&
//         token
//       ) {
//         await rejectCall(
//           token,
//           id
//         );
//       }

//       if (id) {
//         sendSocketMessage({
//           type:
//             "call_reject",

//           call_id:
//             id,

//           receiver_id:
//             targetUserId,
//         });
//       }

//       cleanup();

//       router.back();
//     }, [
//       getToken,
//       rejectCall,
//       sendSocketMessage,
//       targetUserId,
//       cleanup,
//       router,
//     ]);

//   /* =======================================================
//      INITIAL EFFECT
//   ======================================================= */

//   useEffect(() => {
//     mountedRef.current =
//       true;

//     initialize();

//     return () => {
//       mountedRef.current =
//         false;

//       cleanup();
//     };
//   }, []);

//   /* =======================================================
//      LOADING
//   ======================================================= */

//   if (loading) {
//     return (
//       <SafeAreaView
//         style={
//           styles.container
//         }
//       >
//         <ActivityIndicator
//           size="large"
//           color="#FF3D71"
//         />

//         <Text
//           style={
//             styles.loadingText
//           }
//         >
//           Starting{" "}
//           {callType} call...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   /* =======================================================
//      ERROR
//   ======================================================= */

//   if (error) {
//     return (
//       <SafeAreaView
//         style={
//           styles.container
//         }
//       >
//         <Text
//           style={
//             styles.errorTitle
//           }
//         >
//           Call Error
//         </Text>

//         <Text
//           style={
//             styles.errorText
//           }
//         >
//           {error}
//         </Text>

//         <Pressable
//           style={
//             styles.endButton
//           }
//           onPress={() => {
//             cleanup();
//             router.back();
//           }}
//         >
//           <Text
//             style={
//               styles.endButtonText
//             }
//           >
//             Go Back
//           </Text>
//         </Pressable>
//       </SafeAreaView>
//     );
//   }

//   /* =======================================================
//      MAIN UI
//   ======================================================= */

//   return (
//     <SafeAreaView
//       style={
//         styles.container
//       }
//     >
//       {callType ===
//       "video" ? (
//         <View
//           style={
//             styles.videoContainer
//           }
//         >
//           {/* REMOTE VIDEO */}

//           {remoteStream ? (
//             <RTCView
//               streamURL={
//                 remoteStream.toURL()
//               }
//               style={
//                 styles.remoteVideo
//               }
//               objectFit="cover"
//               mirror={false}
//             />
//           ) : (
//             <View
//               style={
//                 styles.waitingVideo
//               }
//             >
//               <Text
//                 style={
//                   styles.waitingTitle
//                 }
//               >
//                 {callStatus}
//               </Text>

//               <Text
//                 style={
//                   styles.waitingSubtitle
//                 }
//               >
//                 Waiting for the other user...
//               </Text>
//             </View>
//           )}

//           {/* LOCAL VIDEO */}

//           {localStream && (
//             <RTCView
//               streamURL={
//                 localStream.toURL()
//               }
//               style={
//                 styles.localVideo
//               }
//               objectFit="cover"
//               mirror
//             />
//           )}

//           {/* STATUS */}

//           <View
//             style={
//               styles.videoStatus
//             }
//           >
//             <Text
//               style={
//                 styles.statusText
//               }
//             >
//               {callStatus}
//             </Text>
//           </View>

//           {/* CONTROLS */}

//           <View
//             style={
//               styles.controls
//             }
//           >
//             <Pressable
//               style={[
//                 styles.controlButton,
//                 isMuted &&
//                   styles.activeControl,
//               ]}
//               onPress={
//                 toggleMute
//               }
//             >
//               <Text
//                 style={
//                   styles.controlIcon
//                 }
//               >
//                 {isMuted
//                   ? "🔇"
//                   : "🎤"}
//               </Text>
//             </Pressable>

//             <Pressable
//               style={
//                 styles.endButtonCircle
//               }
//               onPress={
//                 handleEndCall
//               }
//             >
//               <Text
//                 style={
//                   styles.endIcon
//                 }
//               >
//                 ❌
//               </Text>
//             </Pressable>
//           </View>
//         </View>
//       ) : (
//         <View
//           style={
//             styles.audioContainer
//           }
//         >
//           <View
//             style={
//               styles.avatarCircle
//             }
//           >
//             <Text
//               style={
//                 styles.avatarText
//               }
//             >
//               👤
//             </Text>
//           </View>

//           <Text
//             style={
//               styles.callTitle
//             }
//           >
//             {isIncoming
//               ? "Incoming Audio Call"
//               : "Audio Call"}
//           </Text>

//           <Text
//             style={
//               styles.callStatus
//             }
//           >
//             {callStatus}
//           </Text>

//           {/* INCOMING CONTROLS */}

//           {isIncoming && (
//             <Pressable
//               style={
//                 styles.rejectIncomingButton
//               }
//               onPress={
//                 handleRejectIncoming
//               }
//             >
//               <Text
//                 style={
//                   styles.rejectIncomingText
//                 }
//               >
//                 Reject
//               </Text>
//             </Pressable>
//           )}

//           {/* AUDIO CONTROLS */}

//           <View
//             style={
//               styles.audioControls
//             }
//           >
//             <Pressable
//               style={[
//                 styles.controlButton,
//                 isMuted &&
//                   styles.activeControl,
//               ]}
//               onPress={
//                 toggleMute
//               }
//             >
//               <Text
//                 style={
//                   styles.controlIcon
//                 }
//               >
//                 {isMuted
//                   ? "🔇"
//                   : "🎤"}
//               </Text>
//             </Pressable>

//             <Pressable
//               style={
//                 styles.endButtonCircle
//               }
//               onPress={
//                 handleEndCall
//               }
//             >
//               <Text
//                 style={
//                   styles.endIcon
//                 }
//               >
//                 ❌
//               </Text>
//             </Pressable>
//           </View>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// /* =========================================================
//    STYLES
// ========================================================= */

// const styles =
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: "#000",
//     },

//     loadingText: {
//       color: "#fff",
//       marginTop: 16,
//       fontSize: 16,
//     },

//     errorTitle: {
//       color: "#fff",
//       fontSize: 24,
//       fontWeight: "700",
//       marginBottom: 12,
//     },

//     errorText: {
//       color: "#ccc",
//       fontSize: 15,
//       textAlign: "center",
//       paddingHorizontal: 30,
//       marginBottom: 25,
//     },

//     endButton: {
//       backgroundColor:
//         "#FF3D71",
//       paddingHorizontal: 30,
//       paddingVertical: 14,
//       borderRadius: 25,
//     },

//     endButtonText: {
//       color: "#fff",
//       fontWeight: "700",
//       fontSize: 16,
//     },

//     videoContainer: {
//       flex: 1,
//       backgroundColor: "#000",
//     },

//     remoteVideo: {
//       flex: 1,
//       width: "100%",
//       height: "100%",
//     },

//     waitingVideo: {
//       flex: 1,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: "#171717",
//     },

//     waitingTitle: {
//       color: "#fff",
//       fontSize: 22,
//       fontWeight: "700",
//     },

//     waitingSubtitle: {
//       color: "#aaa",
//       marginTop: 8,
//       fontSize: 14,
//     },

//     localVideo: {
//       position: "absolute",
//       top: 25,
//       right: 20,
//       width: 110,
//       height: 160,
//       borderRadius: 12,
//       backgroundColor: "#222",
//     },

//     videoStatus: {
//       position: "absolute",
//       top: 25,
//       left: 20,
//       backgroundColor:
//         "rgba(0,0,0,0.5)",
//       paddingHorizontal: 14,
//       paddingVertical: 8,
//       borderRadius: 20,
//     },

//     statusText: {
//       color: "#fff",
//       fontSize: 14,
//     },

//     controls: {
//       position: "absolute",
//       bottom: 35,
//       left: 0,
//       right: 0,
//       flexDirection: "row",
//       justifyContent: "center",
//       alignItems: "center",
//       gap: 25,
//     },

//     audioContainer: {
//       flex: 1,
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     avatarCircle: {
//       width: 120,
//       height: 120,
//       borderRadius: 60,
//       backgroundColor: "#252525",
//       alignItems: "center",
//       justifyContent: "center",
//       marginBottom: 25,
//     },

//     avatarText: {
//       fontSize: 55,
//     },

//     callTitle: {
//       color: "#fff",
//       fontSize: 24,
//       fontWeight: "700",
//     },

//     callStatus: {
//       color: "#aaa",
//       marginTop: 10,
//       fontSize: 16,
//     },

//     audioControls: {
//       flexDirection: "row",
//       marginTop: 60,
//       gap: 30,
//     },

//     controlButton: {
//       width: 62,
//       height: 62,
//       borderRadius: 31,
//       backgroundColor: "#292929",
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     activeControl: {
//       backgroundColor: "#555",
//     },

//     controlIcon: {
//       fontSize: 25,
//     },

//     endButtonCircle: {
//       width: 62,
//       height: 62,
//       borderRadius: 31,
//       backgroundColor: "#FF3D71",
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     endIcon: {
//       fontSize: 23,
//     },

//     rejectIncomingButton: {
//       marginTop: 25,
//       paddingHorizontal: 30,
//       paddingVertical: 12,
//       borderRadius: 25,
//       backgroundColor: "#555",
//     },

//     rejectIncomingText: {
//       color: "#fff",
//       fontSize: 16,
//       fontWeight: "600",
//     },
//   });