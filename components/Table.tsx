// CoursesTable.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/theme"; // adjust path
import { TableProps } from "@/types";

function Table<T extends object>(props: TableProps<T>) {
  const { headings, data, keys } = props;
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
      </View>

      {/* Rows */}
      {data.map((item, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {keys.map((k, colIndex) => (
            <Text
              key={colIndex}
              style={[
                styles.cell,
                { textAlign: colIndex === 0 ? "left" : "center" },
              ]}
            >
              {String(item[k] ?? "")}
            </Text>
          ))}
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
});
