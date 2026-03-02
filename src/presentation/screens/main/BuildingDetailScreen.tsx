import React, { useState, useEffect, ComponentProps } from "react";
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

// Tipado para evitar errores de TypeScript en iconos
type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function BuildingDetailScreen({ route, navigation }: any) {
  const { edificioId } = route.params;
  const [loading, setLoading] = useState(true);
  const [edificio, setEdificio] = useState<any>(null);
  const [personal, setPersonal] = useState<any[]>([]);

  const planesDisponibles = ["Gratis", "Basic", "Pro", "Premium"];

  const getPlanIcon = (plan: string): MaterialIconName => {
    switch (plan) {
      case "Gratis": return "leaf";
      case "Basic": return "star-outline";
      case "Pro": return "shield-check-outline";
      case "Premium": return "crown-outline";
      default: return "help-circle-outline";
    }
  };

  const [permisos, setPermisos] = useState({
    canUseNovelties: false,
    canManageBuilding: false,
    canUseSecure: false,
    canViewPlan: false,
    canAccessAdminPanel: false,
    isAppActive: true,
  });

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

  const updateBuildingPlan = async (nuevoPlan: string) => {
    try {
      await updateDoc(doc(db, "edificios", edificioId), { plan: nuevoPlan });
    } catch (e) {
      Alert.alert("Error", "No se pudo actualizar el plan");
    }
  };

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

  // Helpers de Renderizado
  const MaintSwitch = ({ title, mKey, color = "#F59E0B" }: any) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{title}</Text>
      <Switch
        trackColor={{ false: "#1E293B", true: color + "50" }}
        thumbColor={mantenimiento[mKey as keyof typeof mantenimiento] ? color : "#94A3B8"}
        value={mantenimiento[mKey as keyof typeof mantenimiento]}
        onValueChange={() => toggleMantenimiento(mKey as keyof typeof mantenimiento)}
      />
    </View>
  );

  const PermissionCard = ({ title, sub, icon, pKey, color }: any) => (
    <View style={styles.switchCard}>
      <View style={styles.switchInfo}>
        <MaterialCommunityIcons name={icon as MaterialIconName} size={24} color={color} />
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

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#10B981" /></View>;

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
        
        {/* INFO CARD PRINCIPAL */}
        <View style={styles.infoCard}>
          <View style={[styles.statusDot, { backgroundColor: permisos.isAppActive ? "#10B981" : "#EF4444" }]} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.buildingName}>{edificio?.nombreEdificio}</Text>
            <Text style={styles.buildingSub}>NIC: {edificio?.nic || "---"}</Text>
          </View>
          <Switch value={permisos.isAppActive} onValueChange={() => togglePermission("isAppActive")} />
        </View>

        {/* PLAN ACTUAL VISUAL */}
        <View style={styles.currentPlanCard}>
          <MaterialCommunityIcons name={getPlanIcon(edificio?.plan)} size={30} color="#F59E0B" />
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.currentPlanLabel}>PLAN ACTUAL</Text>
            <Text style={styles.currentPlanValue}>{edificio?.plan || "Sin Plan"}</Text>
          </View>
        </View>

        {/* SELECTOR DE PLANES */}
        <Text style={[styles.sectionTitle, { color: "#F59E0B" }]}>Cambiar Suscripción</Text>
        <View style={styles.planGrid}>
          {planesDisponibles.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.planChip, edificio?.plan === p && styles.planChipActive]}
              onPress={() => updateBuildingPlan(p)}
            >
              <MaterialCommunityIcons 
                name={getPlanIcon(p)} 
                size={16} 
                color={edificio?.plan === p ? "#020617" : "#F59E0B"} 
              />
              <Text style={[styles.planChipText, edificio?.plan === p && styles.planChipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* MANTENIMIENTO */}
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
          <MaintSwitch title="Suscripciones" mKey="suscripcion" color="#3B82F6" />
          <View style={styles.divider} />
          <MaintSwitch title="Seguridad/Privacidad" mKey="seguridad" color="#10B981" />
        </View>

        {/* PERMISOS / VISIBILIDAD */}
        <Text style={[styles.sectionTitle, { color: "#EC4899" }]}>Visibilidad de Pantallas</Text>
        <PermissionCard title="Admin Panel" sub="BuildAdminScreen" icon="view-dashboard-edit" pKey="canAccessAdminPanel" color="#EC4899" />
        <PermissionCard title="Secure Screen" sub="Vigilancia" icon="security" pKey="canUseSecure" color="#10B981" />
        <PermissionCard title="Novedades" sub="Uso de Novelties" icon="notebook-edit" pKey="canUseNovelties" color="#F59E0B" />
        <PermissionCard title="Gestión Edificio" sub="Configuración" icon="office-building-cog" pKey="canManageBuilding" color="#3B82F6" />
        <PermissionCard title="Ver Planes" sub="Suscripción" icon="credit-card-search" pKey="canViewPlan" color="#8B5CF6" />

        {/* LISTA DE PERSONAL (RESTAURADO) */}
        <Text style={[styles.sectionTitle, { marginTop: 20, color: "#94A3B8" }]}>Personal del Edificio</Text>
        {personal.length > 0 ? (
          personal.map((item) => (
            <View key={item.id} style={styles.staffCard}>
              <View style={styles.staffInfo}>
                <Ionicons name="person-circle-outline" size={24} color="#3B82F6" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.staffName}>{item.nombre}</Text>
                  <Text style={styles.staffSubText}>{item.rol}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => {/* deleteStaff(item.id) */}}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyStaff}><Text style={styles.emptyText}>Sin personal registrado</Text></View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#020617" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20, backgroundColor: "#0F172A" },
  headerTitle: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  content: { padding: 20 },
  sectionTitle: { color: "#10B981", fontSize: 12, fontWeight: "bold", marginBottom: 15, marginTop: 10, textTransform: "uppercase" },
  infoCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#0F172A", padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: "#1E293B" },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  infoTextContainer: { flex: 1 },
  buildingName: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  buildingSub: { color: "#64748B", fontSize: 11 },
  currentPlanCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 20, borderRadius: 20, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: '#F59E0B' },
  currentPlanLabel: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
  currentPlanValue: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  planGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  planChip: { width: "48%", flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: "#0F172A", paddingVertical: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: "#F59E0B" },
  planChipActive: { backgroundColor: "#F59E0B" },
  planChipText: { color: "#F59E0B", fontSize: 13, fontWeight: "bold", marginLeft: 8 },
  planChipTextActive: { color: "#020617" },
  card: { backgroundColor: "#0F172A", borderRadius: 20, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: "#1E293B" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  switchLabel: { color: "#FFF", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#1E293B", marginVertical: 4 },
  switchCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#0F172A", padding: 15, borderRadius: 18, marginBottom: 8, borderWidth: 1, borderColor: "#1E293B" },
  switchInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  switchTextContainer: { marginLeft: 12, flex: 1 },
  switchTitle: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  switchSub: { color: "#64748B", fontSize: 11 },
  // --- ESTILOS PERSONAL ---
  staffCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0F172A", padding: 15, borderRadius: 18, marginBottom: 8, borderWidth: 1, borderColor: "#1E293B" },
  staffInfo: { flexDirection: "row", alignItems: "center" },
  staffName: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  staffSubText: { color: "#64748B", fontSize: 12 },
  emptyStaff: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 13 }
});