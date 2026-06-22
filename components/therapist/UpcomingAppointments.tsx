import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { hp, moderateScale, normalize } from "@/utils/responsive";
import { Appointment } from "@/types/therapist";

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  isLoading: boolean;
  onJoinSession: (appointment: Appointment) => void;
  onCancelSession: (appointment: Appointment) => void;
}

export const UpcomingAppointments = ({
  appointments,
  isLoading,
  onJoinSession,
  onCancelSession,
}: UpcomingAppointmentsProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>UPCOMING APPOINTMENTS</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3C61DD" />
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.appointmentEmptyCard}>
          <Text style={styles.appointmentEmptyText}>No upcoming sessions scheduled.</Text>
        </View>
      ) : (
        appointments.map((appointment) => (
          <View
            key={appointment.id}
            style={[styles.appointmentCard, { marginBottom: hp(1.5) }]}
          >
            <View style={styles.appointmentHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.therapistName}>{appointment.therapist_name}</Text>
                <Text style={styles.sessionInfo}>
                  {appointment.therapist_specialization &&
                  appointment.therapist_specialization.length > 0
                    ? appointment.therapist_specialization.join(", ")
                    : "Therapy Session"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", marginLeft: moderateScale(10) }}>
                <Text style={styles.appointmentTime}>{appointment.appointment_date}</Text>
                <Text
                  style={[styles.sessionInfo, { color: "#3C61DD", marginTop: hp(0.2) }]}
                  numberOfLines={1}
                >
                  {appointment.time_slot}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => onJoinSession(appointment)}
            >
              <View style={styles.actionLeft}>
                <Feather name="video" size={normalize(20)} color="#3C61DD" />
                <Text style={[styles.actionText, { color: "#3C61DD" }]}>
                  Join Session
                </Text>
              </View>
              <Feather name="chevron-right" size={normalize(18)} color="#3C61DD" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRow, styles.noBorder]}
              onPress={() => onCancelSession(appointment)}
            >
              <View style={styles.actionLeft}>
                <Feather name="alert-circle" size={normalize(20)} color="#E53935" />
                <Text style={[styles.actionText, styles.cancelText]}>Cancel Session</Text>
              </View>
              <Feather name="chevron-right" size={normalize(18)} color="#A0A0A0" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(3),
  },
  sectionLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    color: "#666",
    marginBottom: hp(1.5),
    letterSpacing: 0.5,
  },
  loadingContainer: {
    paddingVertical: hp(4),
    justifyContent: "center",
    alignItems: "center",
  },
  appointmentEmptyCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  appointmentEmptyText: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(14),
    color: "#666",
    textAlign: "center",
  },
  appointmentCard: {
    backgroundColor: "#FFF",
    borderRadius: normalize(16),
    padding: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(2),
  },
  therapistName: {
    fontFamily: Typography.fonts.bold,
    fontSize: normalize(16),
    color: "#000",
  },
  sessionInfo: {
    fontFamily: Typography.fonts.regular,
    fontSize: normalize(13),
    color: "#666",
    marginTop: hp(0.5),
  },
  appointmentTime: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(12),
    lineHeight: normalize(18),
    color: "#E53935",
    textAlign: "right",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: moderateScale(14),
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  noBorder: {
    borderTopWidth: 1,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  actionText: {
    fontFamily: Typography.fonts.medium,
    fontSize: normalize(14),
    color: "#000",
  },
  cancelText: {
    color: "#E53935",
  },
});
