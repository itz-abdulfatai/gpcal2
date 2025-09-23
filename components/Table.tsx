import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/constants/theme";
import { TableProps } from "@/types";

function Table<T extends object>(props: TableProps<T>) {
  const { headings, data, keys, handleDelete } = props;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.row}>
        {headings.map((h, index) => (
          <Text
            key={index}
            style={[
              styles.cell,
              styles.headerText,
              { textAlign: index === 0 ? "left" : "center" },
            ]}
          >
            {h}
          </Text>
        ))}

        {/* empty header cell to align with delete column when present */}
        {handleDelete && <View style={styles.actionCell} />}
      </View>

      {/* Rows */}
      {data.map((item, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {keys.map((k, colIndex) => (
            <Text
              key={String(colIndex)}
              style={[
                styles.cell,
                { textAlign: colIndex === 0 ? "left" : "center" },
              ]}
            >
              {String((item as any)[k] ?? "")}
            </Text>
          ))}

          {handleDelete && (
            <TouchableOpacity
              onPress={() => {
                try {
                  const id = (item as any).id;
                  handleDelete(id);
                } catch (e) {
                  console.warn("Table.handleDelete failed to read id", e);
                }
              }}
              style={styles.deleteButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

export default Table;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary2,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: colors.black,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 15,
  },
  actionCell: {
    width: 40, // reserve space for the delete column in header
  },
  deleteButton: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "red",
    fontWeight: "700",
    fontSize: 16,
  },
});
