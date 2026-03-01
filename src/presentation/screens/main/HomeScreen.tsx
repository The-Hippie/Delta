import React, { useState, useEffect, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Firebase
import { collection, onSnapshot, query } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../../firebaseConfig";

// --- COMPONENTES MEMOIZADOS (Optimizan el renderizado) ---

const StatCard = memo(({ icon, color, value, title }: any) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
));

const BuildingItem = memo(({ item, onPress }: any) => {
  const getPlanColor = (plan: string) => {
    const p = plan?.toLowerCase();
    if (p === "premium") return "#F59E0B";
    if (p === "pro") return "#3B82F6";
    return "#10B981"; // Gratis
  };

  const isBlocked = item.restricciones?.bloqueado === true;

  return (
    <TouchableOpacity
      style={[styles.buildingCard, isBlocked && styles.blockedCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.buildingHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isBlocked ? "#451a1a" : "#1E293B" },
          ]}
        >
          <Ionicons
            name="business"
            size={22}
            color={isBlocked ? "#EF4444" : "#10B981"}
          />
        </View>

        <View style={styles.buildingInfo}>
          <Text style={styles.buildingName} numberOfLines={1}>
            {item.nombreEdificio || item.nombre || "Sin Nombre"}
          </Text>
          <Text style={styles.buildingSub}>
            ID: {item.id.substring(0, 8)}... •{" "}
            {item.ubicacion || "Sin ubicación"}
          </Text>
        </View>

        {isBlocked && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={14} color="#EF4444" />
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View
          style={[
            styles.planBadge,
            { backgroundColor: getPlanColor(item.plan) + "20" },
          ]}
        >
          <Text style={[styles.planText, { color: getPlanColor(item.plan) }]}>
            {item.plan?.toUpperCase() || "GRATIS"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#475569" />
      </View>
    </TouchableOpacity>
  );
});

// --- PANTALLA PRINCIPAL ---

export default function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [edificios, setEdificios] = useState<any[]>([]);

  // 1. Escuchar edificios en tiempo real
  useEffect(() => {
    const q = query(collection(db, "edificios"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEdificios(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener edificios: ", error);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  // 2. Lógica de Cerrar Sesión
  const handleLogout = async () => {
    const logoutAction = async () => {
      try {
        await auth.signOut();
      } catch (e) {
        console.error("Error al cerrar sesión:", e);
      }
    };

    if (Platform.OS === "web") {
      const confirmar = window.confirm("¿Desea salir?");
      if (confirmar) logoutAction();
    } else {
      Alert.alert("Cerrar Sesión", "¿Desea salir?", [
        { text: "No", style: "cancel" },
        { text: "Sí", onPress: logoutAction },
      ]);
    }
  };

  const stats = {
    total: edificios.length,
    pro: edificios.filter(
      (e) =>
        e.plan?.toLowerCase() === "pro" || e.plan?.toLowerCase() === "premium",
    ).length,
    bloqueados: edificios.filter((e) => e.restricciones?.bloqueado === true)
      .length,
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ color: "#94A3B8", marginTop: 10 }}>
          Sincronizando Red Delta...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <FlatList
        data={edificios}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
        style={{ flex: 1 }}
        ListHeaderComponent={() => (
          <>
            {/* CABECERA CON PERFIL Y LOGOUT */}
            <View style={styles.headerInside}>
              <View style={styles.userInfo}>
                <View style={styles.masterAvatar}>
                  <Text style={styles.avatarLetter}>D</Text>
                </View>
                <View>
                  <Text style={styles.userName}>Henry Admin</Text>
                  <Text style={styles.userRole}>Control Maestro Delta</Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.logoutBtn]}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.welcomeText}>Dashboard Global</Text>

            <View style={styles.statsRow}>
              <StatCard
                icon="office-building"
                color="#10B981"
                value={stats.total}
                title="Edificios"
              />
              <StatCard
                icon="star"
                color="#3B82F6"
                value={stats.pro}
                title="Planes Pro"
              />
              <StatCard
                icon="alert-octagon"
                color="#EF4444"
                value={stats.bloqueados}
                title="Bloqueados"
              />
            </View>

            <Text style={styles.sectionTitle}>Edificios Registrados</Text>
          </>
        )}
        renderItem={({ item }) => (
          <BuildingItem
            item={item}
            onPress={() =>
              navigation.navigate("BuildingDetail", { edificioId: item.id })
            }
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-offline-outline" size={50} color="#1E293B" />
            <Text style={styles.emptyText}>
              No hay registros activos en la base de datos.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  centered: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },

  headerInside: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },

  userInfo: { flexDirection: "row", alignItems: "center" },
  masterAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarLetter: { color: "#020617", fontWeight: "bold", fontSize: 18 },
  userName: { color: "#F8FAFC", fontWeight: "bold", fontSize: 16 },
  userRole: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  headerActions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutBtn: {
    backgroundColor: "#451a1a", // Fondo rojizo sutil para el botón de salida
    borderWidth: 1,
    borderColor: "#EF444430",
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  welcomeText: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#0F172A",
    width: "31%",
    borderRadius: 18,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  statValue: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 4,
  },
  statTitle: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  buildingCard: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  blockedCard: { borderColor: "#EF444450", backgroundColor: "#0f0707" },
  buildingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  buildingInfo: { flex: 1 },
  buildingName: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  buildingSub: { color: "#64748B", fontSize: 12, marginTop: 2 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    paddingTop: 12,
  },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  planText: { fontSize: 10, fontWeight: "bold" },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#475569", marginTop: 10, fontSize: 14 },
  lockBadge: { backgroundColor: "#EF444420", padding: 5, borderRadius: 6 },
});
