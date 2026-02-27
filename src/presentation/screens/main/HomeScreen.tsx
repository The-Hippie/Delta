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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Firebase
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../../firebaseConfig"; 

// --- COMPONENTES MEMOIZADOS ---

const StatCard = memo(({ icon, color, value, title }: any) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
));

const BuildingItem = memo(({ item, onPress }: any) => {
  // Manejo de colores por plan
  const getPlanColor = (plan: string) => {
    const p = plan?.toLowerCase();
    if (p === 'premium') return '#F59E0B';
    if (p === 'pro') return '#3B82F6';
    return '#10B981'; // Gratis
  };

  const isBlocked = item.restricciones?.bloqueado === true;

  return (
    <TouchableOpacity 
      style={[styles.buildingCard, isBlocked && styles.blockedCard]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.buildingHeader}>
        <View style={[styles.iconContainer, { backgroundColor: isBlocked ? '#451a1a' : '#1E293B' }]}>
          <Ionicons name="business" size={22} color={isBlocked ? "#EF4444" : "#10B981"} />
        </View>
        
        <View style={styles.buildingInfo}>
          <Text style={styles.buildingName} numberOfLines={1}>
            {item.nombreEdificio || item.nombre || "Sin Nombre"}
          </Text>
          <Text style={styles.buildingSub}>
            ID: {item.id.substring(0, 8)}... • {item.ubicacion || 'Sin ubicación'}
          </Text>
        </View>

        {isBlocked && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={14} color="#EF4444" />
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.planBadge, { backgroundColor: getPlanColor(item.plan) + '20' }]}>
          <Text style={[styles.planText, { color: getPlanColor(item.plan) }]}>
            {item.plan?.toUpperCase() || "GRATIS"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#475569" />
      </View>
    </TouchableOpacity>
  );
});

export default function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [edificios, setEdificios] = useState<any[]>([]);

  useEffect(() => {
    console.log("Iniciando conexión con Firestore...");
    
    // IMPORTANTE: Asegúrate que la colección se llame "edificios" en tu Firebase
    const q = query(collection(db, "edificios"));
    
    const unsub = onSnapshot(q, (snap) => {
      console.log("Snap recibido. Cantidad de documentos:", snap.size);
      
      const docs = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setEdificios(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error en Firestore:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Cálculos rápidos para las StatCards
  const stats = {
    total: edificios.length,
    pro: edificios.filter(e => e.plan?.toLowerCase() === 'pro' || e.plan?.toLowerCase() === 'premium').length,
    bloqueados: edificios.filter(e => e.restricciones?.bloqueado === true).length
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ color: '#94A3B8', marginTop: 10 }}>Cargando Panel Delta...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Estilo SecureGuard */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.masterAvatar}>
            <Text style={styles.avatarLetter}>D</Text>
          </View>
          <View>
            <Text style={styles.userName}>Henry Admin</Text>
            <Text style={styles.userRole}>Control Maestro Delta</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={edificios}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <>
            <Text style={styles.welcomeText}>Dashboard Global</Text>
            
            <View style={styles.statsRow}>
              <StatCard icon="office-building" color="#10B981" value={stats.total} title="Edificios" />
              <StatCard icon="star" color="#3B82F6" value={stats.pro} title="Planes Pro" />
              <StatCard icon="alert-octagon" color="#EF4444" value={stats.bloqueados} title="Bloqueados" />
            </View>

            <Text style={styles.sectionTitle}>Edificios Registrados</Text>
          </>
        )}
        renderItem={({ item }) => (
          <BuildingItem 
            item={item} 
            onPress={() => navigation.navigate("BuildingDetail", { edificioId: item.id })} 
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-offline-outline" size={50} color="#1E293B" />
            <Text style={styles.emptyText}>No se encontraron edificios en la red.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  centered: { flex: 1, backgroundColor: "#020617", justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  masterAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarLetter: { color: '#020617', fontWeight: 'bold', fontSize: 18 },
  userName: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 16 },
  userRole: { color: '#10B981', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: { padding: 20 },
  welcomeText: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: {
    backgroundColor: '#0F172A',
    width: '31%',
    borderRadius: 18,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  statValue: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginVertical: 4 },
  statTitle: { color: '#64748B', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  buildingCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  blockedCard: { borderColor: '#EF444450', backgroundColor: '#0f0707' },
  buildingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  buildingInfo: { flex: 1 },
  buildingName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  buildingSub: { color: '#64748B', fontSize: 12, marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 12
  },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  planText: { fontSize: 10, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#475569', marginTop: 10, fontSize: 14 },
  lockBadge: { backgroundColor: '#EF444420', padding: 5, borderRadius: 6 }
});