import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export default function BuildingDetailScreen({ route, navigation }: any) {
  const { edificioId } = route.params;
  const [loading, setLoading] = useState(true);
  const [edificio, setEdificio] = useState<any>(null);
  const [personal, setPersonal] = useState<any[]>([]);

  // Estado de Permisos (Visibilidad/Acceso total)
  const [permisos, setPermisos] = useState({
    canUseNovelties: false,
    canManageBuilding: false,
    canUseSecure: false,
    canViewPlan: false,
    canAccessAdminPanel: false,
    isAppActive: true,
  });

  // Estado de Mantenimiento (Bloqueo visual/estético)
  const [mantenimiento, setMantenimiento] = useState({
    anuncios: false,
    agregarEdificio: false,
    agregarApartamento: false,
    registrarPersonal: false,
    novedades: false,
    suscripcion: false,
    seguridad: false,
  });

  useEffect(() => {
    const docRef = doc(db, "edificios", edificioId);
    const unsubEdifi = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEdificio({ id: docSnap.id, ...data });

        if (data.permisos) {
          setPermisos({
            canUseNovelties: !!data.permisos.canUseNovelties,
            canManageBuilding: !!data.permisos.canManageBuilding,
            canUseSecure: !!data.permisos.canUseSecure,
            canViewPlan: !!data.permisos.canViewPlan,
            canAccessAdminPanel: !!data.permisos.canAccessAdminPanel,
            isAppActive: data.permisos.isAppActive !== false,
          });
        }

        if (data.mantenimiento) {
          setMantenimiento({
            anuncios: !!data.mantenimiento.anuncios,
            agregarEdificio: !!data.mantenimiento.agregarEdificio,
            agregarApartamento: !!data.mantenimiento.agregarApartamento,
            registrarPersonal: !!data.mantenimiento.registrarPersonal,
            novedades: !!data.mantenimiento.novedades,
            suscripcion: !!data.mantenimiento.suscripcion,
            seguridad: !!data.mantenimiento.seguridad,
          });
        }
      } else {
        navigation.goBack();
      }
      setLoading(false);
    });

    const personalRef = collection(db, "edificios", edificioId, "personal");
    const unsubPersonal = onSnapshot(personalRef, (snap) => {
      setPersonal(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubEdifi();
      unsubPersonal();
    };
  }, [edificioId]);

  const togglePermission = async (key: keyof typeof permisos) => {
    try {
      await updateDoc(doc(db, "edificios", edificioId), {
        [`permisos.${key}`]: !permisos[key],
      });
    } catch (e) {
      Alert.alert("Error", "No se pudo actualizar permiso");
    }
  };

  const toggleMantenimiento = async (key: keyof typeof mantenimiento) => {
    try {
      await updateDoc(doc(db, "edificios", edificioId), {
        [`mantenimiento.${key}`]: !mantenimiento[key],
      });
    } catch (e) {
      Alert.alert("Error", "No se pudo actualizar mantenimiento");
    }
  };

  const deleteBuilding = () => {
    Alert.alert("¡ALERTA!", "¿Borrar permanentemente?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "BORRAR",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "edificios", edificioId));
          navigation.navigate("Home");
        },
      },
    ]);
  };

  // Helper para Mantenimiento
  const MaintSwitch = ({ title, mKey, color = "#F59E0B" }: any) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{title}</Text>
      <Switch
        trackColor={{ false: "#1E293B", true: color + "50" }}
        thumbColor={
          mantenimiento[mKey as keyof typeof mantenimiento] ? color : "#94A3B8"
        }
        value={mantenimiento[mKey as keyof typeof mantenimiento]}
        onValueChange={() =>
          toggleMantenimiento(mKey as keyof typeof mantenimiento)
        }
      />
    </View>
  );

  // Helper para Visibilidad de Pantallas
  const PermissionCard = ({ title, sub, icon, pKey, color }: any) => (
    <View style={styles.switchCard}>
      <View style={styles.switchInfo}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <View style={styles.switchTextContainer}>
          <Text style={styles.switchTitle}>{title}</Text>
          <Text style={styles.switchSub}>{sub}</Text>
        </View>
      </View>
      <Switch
        value={permisos[pKey as keyof typeof permisos] as boolean}
        onValueChange={() => togglePermission(pKey as keyof typeof permisos)}
      />
    </View>
  );

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DELTA CONTROL CENTER</Text>
        <TouchableOpacity onPress={deleteBuilding}>
          <Ionicons name="trash" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: permisos.isAppActive ? "#10B981" : "#EF4444" },
            ]}
          />
          <View style={styles.infoTextContainer}>
            <Text style={styles.buildingName}>{edificio?.nombreEdificio}</Text>
            <Text style={styles.buildingSub}>
              ESTADO: {permisos.isAppActive ? "ACTIVO" : "SUSPENDIDO"}
            </Text>
          </View>
          <Switch
            value={permisos.isAppActive}
            onValueChange={() => togglePermission("isAppActive")}
          />
        </View>

        {/* SECCIÓN MANTENIMIENTO */}
        <Text style={styles.sectionTitle}>Mantenimiento (Bloqueo Visual)</Text>
        <View style={styles.card}>
          <MaintSwitch title="Módulo Anuncios" mKey="anuncios" />
          <View style={styles.divider} />
          <MaintSwitch title="Agregar Edificio" mKey="agregarEdificio" />
          <View style={styles.divider} />
          <MaintSwitch title="Agregar Apartamentos" mKey="agregarApartamento" />
          <View style={styles.divider} />
          <MaintSwitch title="Registrar Personal" mKey="registrarPersonal" />
          <View style={styles.divider} />
          <MaintSwitch title="Libro de Novedades" mKey="novedades" />
          <View style={styles.divider} />
          <MaintSwitch
            title="Suscripciones"
            mKey="suscripcion"
            color="#3B82F6"
          />
          <View style={styles.divider} />
          <MaintSwitch
            title="Seguridad/Privacidad"
            mKey="seguridad"
            color="#10B981"
          />
        </View>

        {/* SECCIÓN PERMISOS / PANTALLAS */}
        <Text style={[styles.sectionTitle, { color: "#EC4899" }]}>
          Visibilidad de Pantallas
        </Text>

        <PermissionCard
          title="Admin Panel"
          sub="Acceso a BuildAdminScreen"
          icon="view-dashboard-edit"
          pKey="canAccessAdminPanel"
          color="#EC4899"
        />
        <PermissionCard
          title="Secure Screen"
          sub="Módulo de Vigilancia"
          icon="security"
          pKey="canUseSecure"
          color="#10B981"
        />
        <PermissionCard
          title="Novedades"
          sub="Uso de NoveltiesScreen"
          icon="notebook-edit"
          pKey="canUseNovelties"
          color="#F59E0B"
        />
        <PermissionCard
          title="Gestión Edificio"
          sub="Configuración estructural"
          icon="office-building-cog"
          pKey="canManageBuilding"
          color="#3B82F6"
        />
        <PermissionCard
          title="Ver Planes"
          sub="Visualización de suscripción"
          icon="credit-card-search"
          pKey="canViewPlan"
          color="#8B5CF6"
        />

        {/* LISTA DE PERSONAL (Simplificada para el ejemplo, pero funcional) */}
        <Text
          style={[styles.sectionTitle, { marginTop: 20, color: "#94A3B8" }]}
        >
          Personal
        </Text>
        {personal.map((item) => (
          <View key={item.id} style={styles.staffCard}>
            <Text style={styles.staffName}>
              {item.nombre} -{" "}
              <Text style={{ fontWeight: "normal" }}>{item.rol}</Text>
            </Text>
            <TouchableOpacity
              onPress={() => {
                /* Tu función deleteStaffMember */
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#0F172A",
  },
  headerTitle: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  content: { padding: 20 },
  sectionTitle: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
    textTransform: "uppercase",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  infoTextContainer: { flex: 1 },
  buildingName: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  buildingSub: { color: "#64748B", fontSize: 11 },
  card: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabel: { color: "#FFF", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#1E293B", marginVertical: 4 },
  switchCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0F172A",
    padding: 15,
    borderRadius: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  switchInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  switchTextContainer: { marginLeft: 12, flex: 1 },
  switchTitle: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  switchSub: { color: "#64748B", fontSize: 11 },
  staffCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#0F172A",
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  staffName: { color: "#FFF", fontSize: 13, fontWeight: "bold" },
});
